
import React from 'react';
import { User, UserRole } from '../types';
import { CoffeeIcon } from '../constants';

interface NavbarProps {
  currentUser: User;
  onLogout: () => void;
  activeView: string;
  setView: (view: any) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentUser, onLogout, activeView, setView }) => {
  return (
    <nav className="bg-white border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="bg-stone-800 p-2 rounded-lg text-white">
              <CoffeeIcon className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-stone-800 tracking-tight">Coffee</span>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => setView('dashboard')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition ${activeView === 'dashboard' ? 'text-stone-900 bg-stone-100' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'}`}
            >
              Dashboard
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-stone-900">{currentUser.name}</p>
              <p className="text-xs text-stone-500">{currentUser.role}</p>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-full transition"
              title="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 flex justify-around py-2 px-4 shadow-lg z-50">
        <button 
          onClick={() => setView('dashboard')}
          className={`flex flex-col items-center p-2 rounded-lg transition ${activeView === 'dashboard' ? 'text-stone-900' : 'text-stone-400'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span className="text-[10px] mt-1 font-medium">Dashboard</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
