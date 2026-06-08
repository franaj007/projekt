import React from 'react';
import { LayoutDashboard, Users, CreditCard, LogOut, Plus } from 'lucide-react';
import type { Group } from '../../api';
import { useAuth } from '../../context/AuthContext';

type View = 'dashboard' | { type: 'group'; group: Group };

interface SidebarProps {
  groups?: Group[];
  activeView?: View;
  onNavigateDashboard?: () => void;
  onNavigateGroup?: (group: Group) => void;
  onCreateGroup?: () => void;
}

export function Sidebar({
  groups = [],
  activeView = 'dashboard',
  onNavigateDashboard,
  onNavigateGroup,
  onCreateGroup,
}: SidebarProps) {
  const { logout } = useAuth();
  const isDashboard = activeView === 'dashboard';
  const activeGroupId =
    typeof activeView === 'object' && activeView.type === 'group'
      ? activeView.group.id
      : null;

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 z-50">
      {/* Logo */}
      <div className="p-6 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/30">
          <CreditCard className="text-white w-6 h-6" />
        </div>
        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
          SplitPay
        </span>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {/* Dashboard */}
        <button
          onClick={onNavigateDashboard}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
            isDashboard
              ? 'bg-primary/10 text-primary dark:bg-primary/20'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <LayoutDashboard
            className={`w-5 h-5 ${isDashboard ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`}
          />
          <span className="font-medium">Dashboard</span>
        </button>

        {/* Groups section */}
        <div className="pt-4 pb-2 px-4 flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-3 h-3" />
            Grupy
          </p>
          <button
            onClick={onCreateGroup}
            title="Nowa grupa"
            className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {groups.length === 0 ? (
          <p className="px-4 text-xs text-gray-400 dark:text-gray-600">Brak grup</p>
        ) : (
          groups.map((group) => {
            const isActive = activeGroupId === group.id;
            const initials = group.name.slice(0, 2).toUpperCase();
            return (
              <button
                key={group.id}
                onClick={() => onNavigateGroup?.(group)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary/10 text-primary dark:bg-primary/20'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 group-hover:bg-gray-300 dark:group-hover:bg-gray-600'
                  }`}
                >
                  {initials}
                </div>
                <span className="font-medium truncate">{group.name}</span>
              </button>
            );
          })
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-1">

        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Wyloguj się</span>
        </button>
      </div>
    </aside>
  );
}
