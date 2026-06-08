import React, { useEffect, useState, useCallback } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { BalanceCards } from './components/dashboard/BalanceCards';
import { RecentActivity } from './components/dashboard/RecentActivity';
import { AddExpenseModal } from './components/dashboard/AddExpenseModal';
import { CreateGroupModal } from './components/groups/CreateGroupModal';
import { GroupView } from './components/groups/GroupView';
import { AuthPage } from './pages/AuthPage';
import { Plus } from 'lucide-react';
import { fetchGroups, fetchExpenses, fetchUsers, type Group, type Expense, type User } from './api';
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';

type View = 'dashboard' | { type: 'group'; group: Group };

function App() {
  const { user, isLoading: authLoading } = useAuth();
  const toast = useToast();

  const [view, setView]       = useState<View>('dashboard');
  const [groups, setGroups]   = useState<Group[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [users, setUsers]     = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);

  const activeGroupId = groups[0]?.id;
  // Use the logged-in user id if available, else fall back to the first loaded user
  const currentUserId = user?.id ?? users[0]?.id ?? '';

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [groupsData, usersData] = await Promise.all([fetchGroups(), fetchUsers()]);
      setGroups(groupsData);
      setUsers(usersData);

      if (groupsData.length > 0) {
        const expensesData = await fetchExpenses(groupsData[0].id);
        setExpenses(expensesData);
      }
    } catch {
      toast.error('Nie udało się załadować danych z serwera.');
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (user) loadData();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Show nothing while restoring auth session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <span className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in → Auth page
  if (!user) return <AuthPage />;

  const isDashboard = view === 'dashboard';

  const handleExpenseAdded = () => {
    loadData();
    toast.success('Wydatek został dodany!');
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 flex font-sans">
      <Sidebar
        groups={groups}
        activeView={view}
        onNavigateDashboard={() => setView('dashboard')}
        onNavigateGroup={(group) => setView({ type: 'group', group })}
        onCreateGroup={() => setCreateGroupOpen(true)}
      />

      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 p-8">
          {isDashboard ? (
            <div className="max-w-5xl mx-auto space-y-8">
              {/* Page title */}
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Cześć, {user.name.split(' ')[0]} 👋
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Oto podsumowanie Twoich finansów ze znajomymi.{' '}
                    Masz{' '}
                    <span className="font-semibold text-gray-700 dark:text-gray-200">
                      {groups.length}
                    </span>{' '}
                    aktywnych grup(y).
                  </p>
                </div>
                <button
                  id="add-expense-btn"
                  onClick={() => {
                    if (groups.length === 0) {
                      toast.info('Musisz najpierw utworzyć grupę!');
                      setCreateGroupOpen(true);
                    } else {
                      setModalOpen(true);
                    }
                  }}
                  className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5"
                >
                  <Plus className="w-5 h-5" />
                  <span>Dodaj wydatek</span>
                </button>
              </div>

              {/* Balances from API */}
              <BalanceCards groupId={activeGroupId} currentUserId={currentUserId} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <RecentActivity expenses={expenses} loading={loading} />
                </div>
                <div className="space-y-6">
                  {/* Invite card */}
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg overflow-hidden relative group cursor-pointer hover:shadow-xl transition-all">
                    <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-500">
                      <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold mb-2 relative z-10">Zaproś znajomych!</h3>
                    <p className="text-indigo-100 text-sm mb-4 max-w-[200px] relative z-10">
                      Rozliczanie się z ekipą jest prostsze, gdy wszyscy używają SplitPay.
                    </p>
                    <button
                      onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.info('Link skopiowany!'); }}
                      className="bg-white text-indigo-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-50 transition-colors relative z-10"
                    >
                      Kopiuj link
                    </button>
                  </div>

                  {/* Quick actions */}
                  <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Szybki Skrót</h3>
                    <div className="space-y-3 flex flex-col">
                      <button
                        onClick={() => {
                          if (groups.length === 0) {
                            toast.info('Musisz najpierw utworzyć grupę!');
                            setCreateGroupOpen(true);
                          } else {
                            setModalOpen(true);
                          }
                        }}
                        className="text-left px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-primary/5 dark:hover:bg-primary/10 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        ➕ Dodaj wydatek
                      </button>
                      {groups[0] && (
                        <button
                          onClick={() => setView({ type: 'group', group: groups[0] })}
                          className="text-left px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
                        >
                          📊 Rozliczenia grupy
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <GroupView
              group={(view as { type: 'group'; group: Group }).group}
              currentUserId={currentUserId}
              onBack={() => setView('dashboard')}
              onExpenseDeleted={() => { loadData(); toast.success('Wydatek usunięty.'); }}
            />
          )}
        </main>
      </div>

      {modalOpen && (
        <AddExpenseModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          groups={groups}
          users={users}
          onExpenseAdded={handleExpenseAdded}
        />
      )}

      {createGroupOpen && (
        <CreateGroupModal
          isOpen={createGroupOpen}
          onClose={() => setCreateGroupOpen(false)}
          users={users}
          onGroupCreated={() => { loadData(); toast.success('Grupa została utworzona!'); }}
        />
      )}
    </div>
  );
}

export default App;
