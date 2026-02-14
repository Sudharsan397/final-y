
import React, { useState } from 'react';
import { Product, Transaction } from '../types';

interface ExporterDashboardProps {
  inventory: Product[];
  transactions: Transaction[];
  onAddTransaction: (t: any) => void;
}

const ExporterDashboard: React.FC<ExporterDashboardProps> = ({ inventory, transactions, onAddTransaction }) => {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const selectedProduct = inventory.find(p => p.id === selectedProductId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!selectedProduct) return;
    const qty = Number(quantity);
    if (qty > selectedProduct.quantity) {
      setError(`Insufficient stock. Only ${selectedProduct.quantity} units available.`);
      return;
    }
    onAddTransaction({
      type: 'export',
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      price: selectedProduct.price,
      quantity: qty
    });
    setQuantity('');
    setSelectedProductId('');
    setSuccess('Export record added successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 uppercase tracking-tight">Export Terminal</h1>
          <p className="text-stone-500 font-medium">Withdraw coffee from warehouse.</p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-200">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">{error}</div>}
            {success && <div className="p-3 bg-green-50 text-green-600 rounded-xl text-sm font-medium border border-green-100">{success}</div>}
            
            <div>
              <label className="block text-sm font-black text-stone-700 mb-1 uppercase tracking-widest">Select Asset</label>
              <select 
                value={selectedProductId}
                onChange={e => setSelectedProductId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-stone-900 text-white border-none focus:ring-2 focus:ring-stone-500 appearance-none outline-none"
                required
              >
                <option value="">Choose stock item...</option>
                {inventory.filter(p => p.quantity > 0).map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.quantity} units left)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-black text-stone-700 mb-1 uppercase tracking-widest">Quantity</label>
              <input 
                type="number" 
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-stone-900 text-white border-none focus:ring-2 focus:ring-stone-500 outline-none"
                max={selectedProduct?.quantity}
                required
              />
            </div>

            <button type="submit" className="w-full bg-red-600 text-white py-4 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-red-700 transition shadow-lg shadow-red-100">
              Execute Export
            </button>
          </form>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-black text-stone-900 uppercase tracking-tight">Export Ledger</h2>
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
                    <td className="px-6 py-4 font-black text-stone-900 uppercase tracking-tight">{t.productName}</td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black text-stone-900 uppercase tracking-widest bg-stone-100 px-2 py-1 rounded-md">{t.userName}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-red-600">-{t.quantity}</td>
                    <td className="px-6 py-4 text-right text-[10px] text-stone-400 font-bold uppercase">
                      {new Date(t.timestamp).toLocaleDateString()}<br/>
                      {new Date(t.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-stone-400 italic font-black uppercase tracking-widest">No export history found</td>
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

export default ExporterDashboard;
