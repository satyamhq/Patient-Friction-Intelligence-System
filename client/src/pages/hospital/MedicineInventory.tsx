import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Button } from '../../components/common/Button';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Pill,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  PlusCircle,
  RefreshCw,
  Edit2,
  TrendingDown,
} from 'lucide-react';

export const MedicineInventory: React.FC = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [stockoutCount, setStockoutCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newStockVal, setNewStockVal] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Medicine Form
  const [addForm, setAddForm] = useState({
    hospitalId: 'default',
    hospitalName: 'District Hospital Pharmacy',
    medicineName: '',
    genericName: '',
    category: 'General Medicine',
    formulation: 'Tablet',
    strength: '500mg',
    quantity: 100,
    unit: 'tablets',
    minimumStockLevel: 50,
    isFree: true,
  });

  const loadInventory = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/medicines', { params });
      if (res.data?.success) {
        setInventory(res.data.inventory || []);
        setStockoutCount(res.data.stockoutCount || 0);
        setLowStockCount(res.data.lowStockCount || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [statusFilter]);

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    try {
      const res = await api.patch(`/medicines/${editingItem.id || editingItem._id}/stock`, {
        quantity: Number(newStockVal),
      });
      if (res.data?.success) {
        setFeedback({ type: 'success', text: `Updated stock for ${editingItem.medicineName || editingItem.name}.` });
        setEditingItem(null);
        loadInventory();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: 'Failed to update stock level' });
    }
  };

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/medicines', addForm);
      if (res.data?.success) {
        setFeedback({ type: 'success', text: 'New medicine added to pharmacy inventory.' });
        setShowAddModal(false);
        setAddForm({
          hospitalId: 'default',
          hospitalName: 'District Hospital Pharmacy',
          medicineName: '',
          genericName: '',
          category: 'General Medicine',
          formulation: 'Tablet',
          strength: '500mg',
          quantity: 100,
          unit: 'tablets',
          minimumStockLevel: 50,
          isFree: true,
        });
        loadInventory();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.response?.data?.message || 'Failed to add medicine' });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Pill className="w-7 h-7 text-teal-600" />
            Hospital Pharmacy & Medicine Inventory
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time drug availability, stockout alerts, and government Jan Aushadhi essential medicines ledger.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={loadInventory} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Add Medicine
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Formulations</span>
          <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{inventory.length}</div>
          <p className="text-xs text-slate-500 mt-0.5">Catalogued in hospital formulary</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Low Stock Warnings</span>
            <TrendingDown className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-2 text-3xl font-black text-amber-600">{lowStockCount}</div>
          <p className="text-xs text-slate-500 mt-0.5">Below reorder threshold</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">Critical Stockouts</span>
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
          <div className="mt-2 text-3xl font-black text-rose-600">{stockoutCount}</div>
          <p className="text-xs text-slate-500 mt-0.5">Immediate replenishment required</p>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-medium border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by medicine name, generic name, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadInventory()}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 w-full sm:w-auto"
        >
          <option value="">All Stock Levels</option>
          <option value="ADEQUATE">Adequate Stock</option>
          <option value="LOW">Low Stock Warning</option>
          <option value="STOCKOUT">Stockout Alert</option>
        </select>
      </div>

      {/* Inventory Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <LoadingSkeleton rows={5} />
          </div>
        ) : inventory.length === 0 ? (
          <EmptyState
            title="No Medicines Found"
            description="No medicine stock records match your query."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Medicine</th>
                  <th className="px-6 py-4">Category / Form</th>
                  <th className="px-6 py-4">Quantity On Hand</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Scheme</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {inventory.map((item) => (
                  <tr key={item.id || item._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {item.medicineName || item.name}
                      </div>
                      {item.genericName && (
                        <div className="text-xs text-slate-400 italic mt-0.5">{item.genericName}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div>{item.category || 'General'}</div>
                      <div className="text-slate-400 mt-0.5">{item.form || item.formulation || 'Tablet'} • {item.strength || ''}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-black text-slate-900 dark:text-white font-mono text-base">
                        {item.quantity ?? item.stockLevel ?? 0}
                      </span>{' '}
                      <span className="text-xs text-slate-400">{item.unit || 'units'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
                          item.status === 'STOCKOUT'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            : item.status === 'LOW'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {item.governmentScheme || (item.isFree ? 'Free Govt Supply' : 'Standard')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setNewStockVal(String(item.quantity ?? item.stockLevel ?? 0));
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Update Stock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stock Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Update Stock for {editingItem.medicineName || editingItem.name}
            </h3>
            <form onSubmit={handleUpdateStock} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  New Quantity On Hand
                </label>
                <input
                  type="number"
                  min="0"
                  value={newStockVal}
                  onChange={(e) => setNewStockVal(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setEditingItem(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Stock
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Medicine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Pill className="w-5 h-5 text-teal-600" />
              Add Medicine to Formulary
            </h3>
            <form onSubmit={handleAddMedicine} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Brand / Medicine Name</label>
                <input
                  type="text"
                  placeholder="e.g. Paracetamol 500mg"
                  value={addForm.medicineName}
                  onChange={(e) => setAddForm({ ...addForm, medicineName: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Generic / Active Salt</label>
                <input
                  type="text"
                  placeholder="e.g. Acetaminophen"
                  value={addForm.genericName}
                  onChange={(e) => setAddForm({ ...addForm, genericName: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Formulation</label>
                  <select
                    value={addForm.formulation}
                    onChange={(e) => setAddForm({ ...addForm, formulation: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Injection">Injection</option>
                    <option value="Sachet">Sachet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Strength</label>
                  <input
                    type="text"
                    placeholder="e.g. 500mg"
                    value={addForm.strength}
                    onChange={(e) => setAddForm({ ...addForm, strength: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Initial Quantity</label>
                  <input
                    type="number"
                    value={addForm.quantity}
                    onChange={(e) => setAddForm({ ...addForm, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Reorder Threshold</label>
                  <input
                    type="number"
                    value={addForm.minimumStockLevel}
                    onChange={(e) => setAddForm({ ...addForm, minimumStockLevel: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button variant="outline" type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Medicine
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
