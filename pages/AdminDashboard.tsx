
import React, { useState } from 'react';
import { User, Product, Transaction, UserRole } from '../types';
import { formatCurrency } from '../constants';

interface AdminDashboardProps {
  users: User[];
  inventory: Product[];
  transactions: Transaction[];
  onAddTransaction: (t: any) => void;
  onManageUser: (id: string, action: 'toggle' | 'delete') => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, inventory, transactions, onAddTransaction, onManageUser }) => {
  const [filterDate, setFilterDate] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'records' | 'actions'>('users');
  
  const [importForm, setImportForm] = useState({ name: '', price: '', quantity: '' });
  const [exportForm, setExportForm] = useState({ productId: '', quantity: '' });
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Filter transactions by both Date and specific Personnel
  const filteredTransactions = transactions.filter(t => {
    const dateMatch = !filterDate || t.timestamp.startsWith(filterDate);
    const userMatch = !filterUser || t.userId === filterUser;
    return dateMatch && userMatch;
  });

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    const existing = inventory.find(p => p.name.toLowerCase() === importForm.name.toLowerCase());
    onAddTransaction({
      type: 'import',
      productId: existing?.id || Math.random().toString(36).substr(2, 9),
      productName: importForm.name,
      price: Number(importForm.price),
      quantity: Number(importForm.quantity)
    });
    setImportForm({ name: '', price: '', quantity: '' });
    setMsg({ type: 'success', text: 'Stock imported successfully!' });
    setTimeout(() => setMsg({ type: '', text: '' }), 3000);
  };

  const handleExport = (e: React.FormEvent) => {
    e.preventDefault();
    const product = inventory.find(p => p.id === exportForm.productId);
    if (!product || product.quantity < Number(exportForm.quantity)) {
      setMsg({ type: 'error', text: 'Insufficient stock!' });
      return;
    }
    onAddTransaction({
      type: 'export',
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: Number(exportForm.quantity)
    });
    setExportForm({ productId: '', quantity: '' });
    setMsg({ type: 'success', text: 'Stock exported successfully!' });
    setTimeout(() => setMsg({ type: '', text: '' }), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-stone-900 uppercase tracking-tight">Admin Terminal</h1>
          <p className="text-stone-500 font-medium">Control center for warehouse operations.</p>
        </div>
        <div className="flex bg-stone-200/50 p-1.5 rounded-2xl overflow-x-auto">
          <button 
            onClick={() => setActiveTab('users')} 
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
            Staff
          </button>
          <button 
            onClick={() => setActiveTab('records')} 
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'records' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
            Ledger
          </button>
          <button 
            onClick={() => setActiveTab('actions')} 
            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'actions' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
            Actions
          </button>
        </div>
      </header>

      {msg.text && (
        <div className={`p-4 rounded-2xl text-xs font-black uppercase tracking-widest border animate-in slide-in-from-top-2 ${msg.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
          {msg.text}
        </div>
      )}

      {activeTab === 'users' && (
        <section className="bg-white rounded-[2.5rem] shadow-sm border border-stone-200 overflow-hidden">
          <div className="p-8 border-b border-stone-100 bg-stone-50/50">
            <h2 className="text-lg font-black text-stone-900 uppercase tracking-tighter">Registered Staff ({users.length}/7)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-stone-50 text-stone-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-8 py-5">Personnel</th>
                  <th className="px-8 py-5">Access Level</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <p className="font-black text-stone-900 text-lg uppercase tracking-tight">{user.name}</p>
                      <p className="text-xs text-stone-500 font-medium">{user.email}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        user.role === UserRole.ADMIN ? 'bg-purple-50 text-purple-700 border-purple-100' :
                        user.role === UserRole.IMPORTER ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.enabled ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${user.enabled ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {user.enabled ? 'Active' : 'Locked'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {user.role !== UserRole.ADMIN ? (
                        <button 
                          onClick={() => onManageUser(user.id, 'toggle')}
                          className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border transition-all ${user.enabled ? 'border-amber-200 text-amber-600 hover:bg-amber-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}
                        >
                          {user.enabled ? 'Suspend Access' : 'Restore Access'}
                        </button>
                      ) : (
                        <span className="text-[10px] text-stone-400 font-black uppercase italic tracking-widest">Master Account</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === 'records' && (
        <section className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-4 bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm">
              <span className="text-xs font-black text-stone-400 uppercase tracking-widest">Date Range</span>
              <input 
                type="date" 
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                className="bg-stone-900 text-white border-none rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-stone-500"
              />
            </div>
            <div className="flex items-center space-x-4 bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm">
              <span className="text-xs font-black text-stone-400 uppercase tracking-widest">Staff Filter</span>
              <select 
                value={filterUser}
                onChange={e => setFilterUser(e.target.value)}
                className="bg-stone-900 text-white border-none rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-stone-500 appearance-none flex-1"
              >
                <option value="">All Personnel</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-sm border border-stone-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-stone-50 text-stone-400 text-[10px] font-black uppercase tracking-widest">
                    <th className="px-8 py-5">Type</th>
                    <th className="px-8 py-5">Product</th>
                    <th className="px-8 py-5">Personnel</th>
                    <th className="px-8 py-5">Total Value</th>
                    <th className="px-8 py-5 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredTransactions.map(t => {
                    const user = users.find(u => u.id === t.userId);
                    return (
                      <tr key={t.id} className="hover:bg-stone-50 transition-colors">
                        <td className="px-8 py-6">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${t.type === 'import' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                            {t.type}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <p className="font-black text-stone-900 text-lg uppercase tracking-tight">{t.productName}</p>
                          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Qty: {t.quantity}</p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-xs font-black text-stone-900 uppercase tracking-tight">{t.userName}</p>
                          {user && (
                            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">[{user.role}]</span>
                          )}
                        </td>
                        <td className="px-8 py-6 text-lg font-black text-stone-900">{formatCurrency(t.price * t.quantity)}</td>
                        <td className="px-8 py-6 text-right text-[10px] text-stone-400 font-black uppercase">
                          {new Date(t.timestamp).toLocaleDateString()}<br/>
                          {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-8 py-16 text-center text-stone-400 font-black italic uppercase tracking-widest">No matching records found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'actions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-sm">
            <h3 className="text-xl font-black mb-6 text-green-700 uppercase tracking-tighter">Direct Import</h3>
            <form onSubmit={handleImport} className="space-y-5">
              <input list="prods" placeholder="Product Name" className="w-full p-4 rounded-2xl bg-stone-900 text-white text-sm font-bold border-none focus:ring-2 focus:ring-stone-500 outline-none placeholder:text-stone-600" value={importForm.name} onChange={e => setImportForm({...importForm, name: e.target.value})} required />
              <datalist id="prods">{inventory.map(p => <option key={p.id} value={p.name} />)}</datalist>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Unit Price (₹)" className="p-4 rounded-2xl bg-stone-900 text-white text-sm font-bold border-none focus:ring-2 focus:ring-stone-500 outline-none placeholder:text-stone-600" value={importForm.price} onChange={e => setImportForm({...importForm, price: e.target.value})} required />
                <input type="number" placeholder="Quantity" className="p-4 rounded-2xl bg-stone-900 text-white text-sm font-bold border-none focus:ring-2 focus:ring-stone-500 outline-none placeholder:text-stone-600" value={importForm.quantity} onChange={e => setImportForm({...importForm, quantity: e.target.value})} required />
              </div>
              <button className="w-full bg-green-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-100">Execute Import</button>
            </form>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-sm">
            <h3 className="text-xl font-black mb-6 text-red-700 uppercase tracking-tighter">Direct Export</h3>
            <form onSubmit={handleExport} className="space-y-5">
              <select className="w-full p-4 rounded-2xl bg-stone-900 text-white text-sm font-bold border-none focus:ring-2 focus:ring-stone-500 outline-none appearance-none" value={exportForm.productId} onChange={e => setExportForm({...exportForm, productId: e.target.value})} required>
                <option value="">Select Asset</option>
                {inventory.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.quantity})</option>)}
              </select>
              <input type="number" placeholder="Quantity to Take" className="w-full p-4 rounded-2xl bg-stone-900 text-white text-sm font-bold border-none focus:ring-2 focus:ring-stone-500 outline-none placeholder:text-stone-600" value={exportForm.quantity} onChange={e => setExportForm({...exportForm, quantity: e.target.value})} required />
              <button className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-100">Execute Export</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
