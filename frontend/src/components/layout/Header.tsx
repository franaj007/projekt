import React from 'react';
import { Search, Moon, Sun, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function useDarkMode() {
  const [dark, setDark] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  });

  React.useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  return [dark, setDark] as const;
}

export function Header() {
  const { user, logout } = useAuth();
  const [dark, setDark] = useDarkMode();

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <header className="sticky top-0 z-40 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 flex-1 w-full md:w-auto">
          {/* Dark mode toggle */}
          <button
            onClick={() => setDark((d) => !d)}
            title={dark ? 'Tryb jasny' : 'Tryb ciemny'}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
          >
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* User */}
          <div className="flex items-center space-x-3 pl-3 border-l border-gray-200 dark:border-gray-700">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold shadow-md">
              {initials}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name ?? 'Użytkownik'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email ?? ''}</p>
            </div>
            <button
              onClick={logout}
              title="Wyloguj się"
              className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
