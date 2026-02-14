
import React, { useState } from 'react';
import { User } from '../types';
import { CoffeeIcon } from '../constants';
import { supabase } from '../supabase';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
  onForgot: () => void;
  onGoToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ users, onLogin, onForgot, onGoToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.user) {
        // Fetch the latest profile from the DB directly to avoid stale state issues
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (profileError || !profile) {
          setError('User profile not found in database. Please contact Admin.');
          await supabase.auth.signOut();
        } else if (!profile.enabled) {
          setError('Your account is disabled. Contact Admin.');
          await supabase.auth.signOut();
        } else {
          onLogin(profile as User);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Check email/password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-stone-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center bg-stone-800 text-white p-4 rounded-2xl mb-4 shadow-lg shadow-stone-200">
            <CoffeeIcon className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Welcome to Coffee</h1>
          <p className="text-stone-500 mt-2">Inventory Management Portal</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-stone-200 border border-stone-100 mb-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">{error}</div>}
            
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-stone-800 text-white border border-stone-700 focus:ring-2 focus:ring-stone-500 focus:border-transparent outline-none transition"
                required
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-sm font-semibold text-stone-700">Password</label>
                <button type="button" onClick={onForgot} className="text-sm font-semibold text-stone-500 hover:text-stone-800">Forgot?</button>
              </div>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-stone-800 text-white border border-stone-700 focus:ring-2 focus:ring-stone-500 focus:border-transparent outline-none transition"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-stone-800 text-white py-4 rounded-xl font-bold hover:bg-stone-900 transition shadow-lg shadow-stone-200 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-stone-100 text-center">
            <p className="text-stone-500 text-sm">
              Don't have an account? {' '}
              <button onClick={onGoToRegister} className="text-stone-800 font-bold hover:underline">Register Now</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
