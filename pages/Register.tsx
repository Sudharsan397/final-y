
import React, { useState, useMemo } from 'react';
import { User, UserRole } from '../types';
import { CoffeeIcon } from '../constants';

interface RegisterProps {
  users: User[];
  onRegister: (user: Omit<User, 'id' | 'enabled'>) => void;
  onBack: () => void;
}

const Register: React.FC<RegisterProps> = ({ users, onRegister, onBack }) => {
  const [role, setRole] = useState<UserRole>(UserRole.IMPORTER);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const counts = useMemo(() => {
    return {
      admin: users.filter(u => u.role === UserRole.ADMIN).length,
      importer: users.filter(u => u.role === UserRole.IMPORTER).length,
      exporter: users.filter(u => u.role === UserRole.EXPORTER).length,
    };
  }, [users]);

  const isRoleFull = (selectedRole: UserRole) => {
    if (selectedRole === UserRole.ADMIN) return counts.admin >= 1;
    if (selectedRole === UserRole.IMPORTER) return counts.importer >= 3;
    if (selectedRole === UserRole.EXPORTER) return counts.exporter >= 3;
    return false;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (isRoleFull(role)) {
      setError(`User limit reached for ${role.toLowerCase()} role`);
      return;
    }
    
    if (users.length >= 7) {
      setError('Total system user limit (7) reached.');
      return;
    }

    onRegister({ name, email, password, role });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-stone-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-stone-800 text-white p-3 rounded-2xl mb-4 shadow-md">
            <CoffeeIcon className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900">Create Account</h1>
          <p className="text-stone-500 mt-1">Join the Milano Coffee Network</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-stone-200 border border-stone-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">{error}</div>}

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1 text-center">Select Role</label>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  type="button" 
                  onClick={() => setRole(UserRole.ADMIN)}
                  className={`py-3 rounded-xl border text-[10px] font-bold transition flex flex-col items-center justify-center ${role === UserRole.ADMIN ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'}`}
                >
                  <span>Admin</span>
                  <span className="opacity-70">({counts.admin}/1)</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => setRole(UserRole.IMPORTER)}
                  className={`py-3 rounded-xl border text-[10px] font-bold transition flex flex-col items-center justify-center ${role === UserRole.IMPORTER ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'}`}
                >
                  <span>Importer</span>
                  <span className="opacity-70">({counts.importer}/3)</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => setRole(UserRole.EXPORTER)}
                  className={`py-3 rounded-xl border text-[10px] font-bold transition flex flex-col items-center justify-center ${role === UserRole.EXPORTER ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'}`}
                >
                  <span>Exporter</span>
                  <span className="opacity-70">({counts.exporter}/3)</span>
                </button>
              </div>
              {isRoleFull(role) && <p className="text-red-500 text-[11px] mt-1 font-medium text-center">Role limit reached for {role}</p>}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-stone-800 text-white border border-stone-700 outline-none focus:ring-2 focus:ring-stone-500" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-stone-800 text-white border border-stone-700 outline-none focus:ring-2 focus:ring-stone-500" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Password (min 6 chars)</label>
                <input type="password" minLength={6} value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-stone-800 text-white border border-stone-700 outline-none focus:ring-2 focus:ring-stone-500" required />
              </div>
            </div>

            <button type="submit" disabled={isRoleFull(role)} className="w-full bg-stone-800 text-white py-4 rounded-xl font-bold hover:bg-stone-900 transition shadow-lg shadow-stone-200 disabled:opacity-50 disabled:cursor-not-allowed">
              Register Account
            </button>
            <button type="button" onClick={onBack} className="w-full text-stone-500 text-sm font-semibold py-2 hover:text-stone-800 transition">
              Back to Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
