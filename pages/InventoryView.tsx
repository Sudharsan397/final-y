
import React from 'react';
import { Product, Transaction, UserRole } from '../types';
import { formatCurrency } from '../constants';

interface InventoryViewProps {
  inventory: Product[];
  transactions: Transaction[];
  role: UserRole;
}

const InventoryView: React.FC<InventoryViewProps> = ({ inventory, transactions, role }) => {
  const availableStock = inventory.filter(p => p.quantity > 0);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-stone-900 uppercase tracking-tight">Active Stock</h2>
          <p className="text-stone-500 font-medium italic">Current warehouse volume.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {availableStock.map(product => (
            <div key={product.id} className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm hover:border-stone-900 transition-all duration-300">
              <h3 className="text-xl font-black text-stone-900 uppercase tracking-tighter truncate">{product.name}</h3>
              <div className="mt-6 flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-stone-400 font-black uppercase mb-1 tracking-widest">Available</p>
                  <p className="text-4xl font-black text-stone-900">{product.quantity}</p>
                </div>
                {role !== UserRole.EXPORTER && (
                  <div className="text-right">
                    <p className="text-[10px] text-stone-400 font-black uppercase mb-1 tracking-widest">Unit Rate</p>
                    <p className="text-sm font-bold text-stone-700">{formatCurrency(product.price)}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
          {availableStock.length === 0 && (
            <div className="col-span-full py-16 text-center bg-stone-50 rounded-[3rem] border-4 border-dashed border-stone-200">
              <p className="text-stone-400 font-black uppercase tracking-widest italic opacity-50">Warehouse Empty</p>
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-stone-900 uppercase tracking-tight">Operation History</h2>
          <p className="text-stone-500 font-medium italic">Full ledger of movements.</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl border border-stone-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-stone-50 text-stone-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5">Product</th>
                  <th className="px-8 py-5">Personnel</th>
                  {role !== UserRole.EXPORTER && <th className="px-8 py-5">Total Value</th>}
                  <th className="px-8 py-5">Quantity</th>
                  <th className="px-8 py-5 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {transactions.map(t => (
                  <tr key={t.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${t.type === 'import' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="px-8 py-6 font-black text-stone-900 text-lg uppercase tracking-tight">{t.productName}</td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-black text-stone-900 uppercase tracking-tight">{t.userName}</p>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest italic">Authorized Staff</p>
                    </td>
                    {role !== UserRole.EXPORTER && (
                      <td className="px-8 py-6 text-lg font-black text-stone-900">
                        {formatCurrency(t.price * t.quantity)}
                      </td>
                    )}
                    <td className="px-8 py-6">
                      <span className={`text-lg font-black ${t.type === 'import' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.type === 'import' ? '+' : '-'}{t.quantity}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right text-[10px] text-stone-400 font-bold uppercase tracking-tight">
                      {new Date(t.timestamp).toLocaleDateString()}<br/>
                      {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={role !== UserRole.EXPORTER ? 6 : 5} className="px-8 py-16 text-center text-stone-400 font-black italic uppercase tracking-widest">No records in ledger</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InventoryView;
