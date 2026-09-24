import fs from 'fs';
import path from 'path';
import { IStorageProvider, UploadResult } from './IStorageProvider.js';

export class LocalStorageProvider implements IStorageProvider {
  public readonly name = 'Local File System';
  private uploadsDir: string;
  private publicBaseUrl: string;

  constructor(uploadsDir?: string, publicBaseUrl?: string) {
    this.uploadsDir = uploadsDir || path.resolve(process.cwd(), 'uploads');
    this.publicBaseUrl = publicBaseUrl || '/uploads';
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  public async saveFile(
    filename: string,
    buffer: Buffer,
    mimeType: string
  ): Promise<UploadResult> {
    const safeName = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const targetPath = path.join(this.uploadsDir, safeName);
    await fs.promises.writeFile(targetPath, buffer);

    return {
      url: `${this.publicBaseUrl}/${safeName}`,
      key: safeName,
      sizeBytes: buffer.length,
      mimeType,
      provider: 'local',
    };
  }

  public async getFile(key: string): Promise<Buffer | null> {
    const safeKey = path.basename(key);
    const targetPath = path.join(this.uploadsDir, safeKey);
    try {
      if (fs.existsSync(targetPath)) {
        return await fs.promises.readFile(targetPath);
      }
    } catch {
      // Ignore
    }
    return null;
  }

  public async deleteFile(key: string): Promise<boolean> {
    const safeKey = path.basename(key);
    const targetPath = path.join(this.uploadsDir, safeKey);
    try {
      if (fs.existsSync(targetPath)) {
        await fs.promises.unlink(targetPath);
        return true;
      }
    } catch {
      // Ignore
    }
    return false;
  }
}
