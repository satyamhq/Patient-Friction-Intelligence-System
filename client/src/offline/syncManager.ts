import { offlineDb, SyncQueueItem } from './db';
import api from '../services/api';

export type SyncState = 'ONLINE' | 'OFFLINE' | 'SYNCING' | 'SYNCED' | 'ERROR';

type Listener = (state: {
  isOnline: boolean;
  syncState: SyncState;
  pendingCount: number;
  lastSyncedAt?: string;
}) => void;

class SyncManager {
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private syncState: SyncState = this.isOnline ? 'ONLINE' : 'OFFLINE';
  private lastSyncedAt?: string;
  private listeners: Set<Listener> = new Set();
  private isFlushing: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));

      // Periodic check every 30 seconds
      setInterval(() => {
        if (this.isOnline && !this.isFlushing) {
          this.flushQueue();
        }
      }, 30000);
    }
  }

  private handleNetworkChange(online: boolean) {
    this.isOnline = online;
    this.syncState = online ? 'ONLINE' : 'OFFLINE';
    this.notify();

    if (online) {
      this.flushQueue();
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    this.notify();
    return () => this.listeners.delete(listener);
  }

  private async notify() {
    let pendingCount = 0;
    try {
      pendingCount = await offlineDb.syncQueue.where('status').equals('QUEUED').count();
    } catch {
      pendingCount = 0;
    }

    this.listeners.forEach((l) =>
      l({
        isOnline: this.isOnline,
        syncState: this.syncState,
        pendingCount,
        lastSyncedAt: this.lastSyncedAt,
      })
    );
  }

  public async enqueueMutation(
    type: 'PATIENT_REGISTRATION' | 'TRIAGE_ASSESSMENT' | 'REVISIT_COMPLETION' | 'REFERRAL_INITIATION',
    payload: any
  ): Promise<string> {
    const id = 'mut-' + Math.random().toString(36).substring(2, 10) + '-' + Date.now();
    const item: SyncQueueItem = {
      id,
      type,
      payload,
      timestamp: new Date().toISOString(),
      status: 'QUEUED',
      retryCount: 0,
    };

    await offlineDb.syncQueue.put(item);
    this.notify();

    if (this.isOnline) {
      // Try background flush immediately
      this.flushQueue();
    }

    return id;
  }

  public async flushQueue(): Promise<void> {
    if (this.isFlushing || !this.isOnline) return;

    try {
      const queuedItems = await offlineDb.syncQueue.where('status').equals('QUEUED').toArray();
      if (queuedItems.length === 0) return;

      this.isFlushing = true;
      this.syncState = 'SYNCING';
      this.notify();

      const mutationsPayload = queuedItems.map((item) => ({
        id: item.id,
        type: item.type,
        timestamp: item.timestamp,
        payload: item.payload,
      }));

      const res = await api.post('/sync/flush', { mutations: mutationsPayload });

      if (res.data?.success) {
        // Mark items as synced or remove them
        const ids = queuedItems.map((i) => i.id);
        await offlineDb.syncQueue.bulkDelete(ids);
        this.lastSyncedAt = new Date().toLocaleTimeString();
        this.syncState = 'SYNCED';
      }
    } catch (err) {
      console.warn('[SyncManager] Flush failed, will retry on next reconnect:', err);
      this.syncState = this.isOnline ? 'ONLINE' : 'OFFLINE';
    } finally {
      this.isFlushing = false;
      this.notify();
    }
  }

  public getStatus() {
    return {
      isOnline: this.isOnline,
      syncState: this.syncState,
      lastSyncedAt: this.lastSyncedAt,
    };
  }
}

export const syncManager = new SyncManager();
