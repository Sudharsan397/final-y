
import React, { useState } from 'react';
import { Product, Transaction } from '../types';
import { formatCurrency } from '../constants';

interface ImporterDashboardProps {
  inventory: Product[];
  transactions: Transaction[];
  onAddTransaction: (t: any) => void;
}

const ImporterDashboard: React.FC<ImporterDashboardProps> = ({ inventory, transactions, onAddTransaction }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: ''
  });
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const existing = inventory.find(p => p.name.toLowerCase() === formData.name.toLowerCase());
    onAddTransaction({
      type: 'import',
      productId: existing?.id || Math.random().toString(36).substr(2, 9),
      productName: formData.name,
      price: Number(formData.price),
      quantity: Number(formData.quantity)
    });
    setFormData({ name: '', price: '', quantity: '' });
    setSuccess('Import record added successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 uppercase tracking-tight">Import Terminal</h1>
          <p className="text-stone-500 font-medium">Add or replenish coffee stock.</p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-200">
          <form onSubmit={handleSubmit} className="space-y-5">
            {success && <div className="p-3 bg-green-50 text-green-600 rounded-xl text-sm font-medium border border-green-100">{success}</div>}
            
            <div>
              <label className="block text-sm font-black text-stone-700 mb-1 uppercase tracking-widest">Product Name</label>
              <input 
                list="products"
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-stone-900 text-white border-none focus:ring-2 focus:ring-stone-500 outline-none"
                required
              />
              <datalist id="products">{inventory.map(p => <option key={p.id} value={p.name} />)}</datalist>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-black text-stone-700 mb-1 uppercase tracking-widest">Unit Price (₹)</label>
                <input 
                  type="number" 
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-stone-900 text-white border-none focus:ring-2 focus:ring-stone-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-black text-stone-700 mb-1 uppercase tracking-widest">Quantity</label>
                <input 
                  type="number" 
                  value={formData.quantity}
                  onChange={e => setFormData({...formData, quantity: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-stone-900 text-white border-none focus:ring-2 focus:ring-stone-500 outline-none"
                  required
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-green-600 text-white py-4 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-green-700 transition shadow-lg shadow-green-100">
              Execute Import
            </button>
          </form>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-black text-stone-900 uppercase tracking-tight">Import Ledger</h2>
        <div className="bg-white rounded-[2rem] shadow-sm border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-stone-50 text-stone-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Personnel</th>
                  <th className="px-6 py-4">Qty</th>
                  <th className="px-6 py-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {transactions.slice(0, 15).map(t => (
                  <tr key={t.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-black text-stone-900 uppercase tracking-tight">{t.productName}</p>
                      <p className="text-[10px] text-stone-400 font-bold">{formatCurrency(t.price * t.quantity)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black text-stone-900 uppercase tracking-widest bg-stone-100 px-2 py-1 rounded-md">{t.userName}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-green-600">+{t.quantity}</td>
                    <td className="px-6 py-4 text-right text-[10px] text-stone-400 font-bold uppercase">
                      {new Date(t.timestamp).toLocaleDateString()}<br/>
                      {new Date(t.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-stone-400 italic font-black uppercase tracking-widest">No import history found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImporterDashboard;
