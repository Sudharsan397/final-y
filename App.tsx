
import React, { useState, useEffect } from 'react';
import { User, UserRole, Product, Transaction, AppState } from './types';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import ImporterDashboard from './pages/ImporterDashboard';
import ExporterDashboard from './pages/ExporterDashboard';
import Navbar from './components/Navbar';
import { supabase } from './supabase';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    users: [],
    inventory: [],
    transactions: [],
    currentUser: null,
  });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'login' | 'register' | 'dashboard' | 'forgot'>('login');

  const fetchData = async () => {
    try {
      const { data: usersData } = await supabase.from('users').select('*');
      const { data: inventoryData } = await supabase.from('inventory').select('*').gt('quantity', 0);
      const { data: transactionsData } = await supabase.from('transactions')
        .select('*')
        .order('timestamp', { ascending: false });

      // Map from DB snake_case to Frontend camelCase
      const mappedTransactions: Transaction[] = (transactionsData || []).map(t => ({
        id: t.id,
        type: t.type as 'import' | 'export',
        productId: t.product_id,
        productName: t.product_name,
        quantity: t.quantity,
        price: t.price,
        userId: t.user_id,
        userName: t.user_name,
        timestamp: t.timestamp
      }));

      setState(prev => ({
        ...prev,
        users: usersData || [],
        inventory: inventoryData || [],
        transactions: mappedTransactions,
      }));
    } catch (error) {
      console.error('Data sync error:', error);
    }
  };

  useEffect(() => {
    const initApp = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase.from('users').select('*').eq('id', session.user.id).single();
        if (profile && profile.enabled) {
          setState(prev => ({ ...prev, currentUser: profile as User }));
          setView('dashboard');
        }
      }
      await fetchData();
      setLoading(false);
    };

    initApp();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase.from('users').select('*').eq('id', session.user.id).single();
        if (profile && profile.enabled) {
          setState(prev => ({ ...prev, currentUser: profile as User }));
          setView('dashboard');
          fetchData();
        }
      } else if (event === 'SIGNED_OUT') {
        setState(prev => ({ ...prev, currentUser: null }));
        setView('login');
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleLogin = (user: User) => {
    setState(prev => ({ ...prev, currentUser: user }));
    setView('dashboard');
    fetchData();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleAddTransaction = async (transaction: Omit<Transaction, 'id' | 'timestamp' | 'userId' | 'userName'>) => {
    if (!state.currentUser) return;

    const transactionId = Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();

    const dbTransaction = {
      id: transactionId,
      type: transaction.type,
      product_id: transaction.productId,
      product_name: transaction.productName,
      quantity: transaction.quantity,
      price: transaction.price,
      user_id: state.currentUser.id,
      user_name: state.currentUser.name,
      timestamp: now
    };

    try {
      const { error: txError } = await supabase.from('transactions').insert([dbTransaction]);
      if (txError) throw txError;

      const productIndex = state.inventory.findIndex(p => p.id === transaction.productId);

      if (transaction.type === 'import') {
        if (productIndex >= 0) {
          const updatedQty = state.inventory[productIndex].quantity + transaction.quantity;
          await supabase.from('inventory').update({ 
            quantity: updatedQty,
            price: transaction.price
          }).eq('id', transaction.productId);
        } else {
          await supabase.from('inventory').insert([{
            id: transaction.productId,
            name: transaction.productName,
            price: transaction.price,
            quantity: transaction.quantity
          }]);
        }
      } else {
        if (productIndex >= 0) {
          const updatedQty = state.inventory[productIndex].quantity - transaction.quantity;
          if (updatedQty <= 0) {
            await supabase.from('inventory').delete().eq('id', transaction.productId);
          } else {
            await supabase.from('inventory').update({ 
              quantity: updatedQty 
            }).eq('id', transaction.productId);
          }
        }
      }
      await fetchData();
    } catch (error: any) {
      alert("Operation failed: " + error.message);
    }
  };

  const manageUser = async (userId: string, action: 'toggle' | 'delete') => {
    try {
      if (action === 'toggle') {
        const user = state.users.find(u => u.id === userId);
        if (user) {
          await supabase.from('users').update({ enabled: !user.enabled }).eq('id', userId);
        }
      }
      await fetchData();
    } catch (error: any) {
      alert("User action failed: " + error.message);
    }
  };

  const registerUser = async (userData: Omit<User, 'id' | 'enabled'>) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password!,
        options: {
          data: {
            name: userData.name,
            role: userData.role
          }
        }
      });

      if (authError) throw authError;
      alert("Registration successful. Please login.");
      setView('login');
      fetchData();
    } catch (error: any) {
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-800 mx-auto"></div>
          <p className="mt-4 text-xs font-black text-stone-400 uppercase tracking-widest">Coffee System Syncing...</p>
        </div>
      </div>
    );
  }

  const renderView = () => {
    if (view === 'login') return <Login users={state.users} onLogin={handleLogin} onForgot={() => setView('forgot')} onGoToRegister={() => setView('register')} />;
    if (view === 'register') return <Register users={state.users} onRegister={registerUser} onBack={() => setView('login')} />;
    if (view === 'forgot') return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl w-full max-w-md border border-stone-100 text-center">
          <h2 className="text-2xl font-black text-stone-900 mb-4 uppercase tracking-tight">Security Protocol</h2>
          <p className="text-stone-500 mb-8 font-medium">Please contact the System Admin to reset your credentials manually.</p>
          <button onClick={() => setView('login')} className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold uppercase text-xs tracking-widest">Back to Login</button>
        </div>
      </div>
    );

    if (!state.currentUser) return null;

    return (
      <div className="min-h-screen">
        <Navbar currentUser={state.currentUser} onLogout={handleLogout} activeView={view} setView={setView} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {view === 'dashboard' && (
            <>
              {state.currentUser.role === UserRole.ADMIN && (
                <AdminDashboard users={state.users} inventory={state.inventory} transactions={state.transactions} onAddTransaction={handleAddTransaction} onManageUser={manageUser} />
              )}
              {state.currentUser.role === UserRole.IMPORTER && (
                <ImporterDashboard 
                  inventory={state.inventory} 
                  transactions={state.transactions.filter(t => t.type === 'import')} 
                  onAddTransaction={handleAddTransaction} 
                />
              )}
              {state.currentUser.role === UserRole.EXPORTER && (
                <ExporterDashboard 
                  inventory={state.inventory} 
                  transactions={state.transactions.filter(t => t.type === 'export')} 
                  onAddTransaction={handleAddTransaction} 
                />
              )}
            </>
          )}
        </main>
      </div>
    );
  };

  return <div className="min-h-screen bg-stone-50 font-inter antialiased">{renderView()}</div>;
};

export default App;
