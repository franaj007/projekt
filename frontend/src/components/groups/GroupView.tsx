import React, { useEffect, useState } from 'react';
import { ArrowLeft, Users, Receipt, ArrowRight, Trash2, Search } from 'lucide-react';
import {
  fetchExpenses,
  fetchSettlements,
  deleteExpense,
  addExpense,
  deleteGroup,
  type Group,
  type Expense,
  type Settlement,
  type SettlementBalance,
} from '../../api';

interface GroupViewProps {
  group: Group;
  currentUserId: string;
  onBack: () => void;
  onExpenseDeleted?: () => void;
}

export function GroupView({ group, currentUserId, onBack, onExpenseDeleted }: GroupViewProps) {
  const [expenses, setExpenses]     = useState<Expense[]>([]);
  const [balances, setBalances]     = useState<SettlementBalance[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState<'expenses' | 'settlements'>('expenses');
  const [search, setSearch]         = useState('');
  const [deleting, setDeleting]     = useState<string | null>(null);

  const reload = () => {
    setLoading(true);
    Promise.all([fetchExpenses(group.id), fetchSettlements(group.id)])
      .then(([expData, settlData]) => {
        setExpenses(expData);
        setBalances(settlData.balances);
        setSettlements(settlData.settlements);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { reload(); }, [group.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const members = group.members.map((m) => m.user);

  const filteredExpenses = expenses.filter(
    (e) =>
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.paidBy.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Usunąć ten wydatek?')) return;
    setDeleting(id);
    try {
      await deleteExpense(id);
      reload();
      onExpenseDeleted?.();
    } catch (err: any) {
      alert(err.message ?? 'Nie udało się usunąć wydatku.');
    } finally {
      setDeleting(null);
    }
  };

  const handleSettleUp = async (s: Settlement) => {
    if (!confirm(`Czy na pewno chcesz potwierdzić zwrot ${s.amount.toFixed(2)} PLN dla ${s.to.name}?`)) return;
    try {
      setLoading(true);
      await addExpense({
        groupId: group.id,
        paidById: s.from.id,
        amount: s.amount,
        description: 'Uregulowanie długu',
        splits: [{ userId: s.to.id, amount: s.amount }]
      });
      reload();
      onExpenseDeleted?.();
    } catch (err: any) {
      alert(err.message ?? 'Nie udało się uregulować długu.');
      setLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!confirm('Czy na pewno chcesz usunąć całą grupę? Tej operacji nie można cofnąć!')) return;
    try {
      setLoading(true);
      await deleteGroup(group.id);
      onExpenseDeleted?.(); // Trigger App data reload
      onBack(); // Go back to dashboard
    } catch (err: any) {
      alert(err.message ?? 'Nie udało się usunąć grupy.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back + Title */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{group.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {members.length} członków · {expenses.length} wydatków
            </p>
          </div>
        </div>
        <button
          onClick={handleDeleteGroup}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Usuń grupę</span>
        </button>
      </div>

      {/* Members strip */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-gray-900 dark:text-white">Członkowie</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {members.map((u) => {
            const initials = u.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
            const isMe = u.id === currentUserId;
            const balance = balances.find((b) => b.userId === u.id)?.balance ?? 0;
            return (
              <div
                key={u.id}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {u.name.split(' ')[0]}{isMe && ' (Ty)'}
                  </p>
                  <p className={`text-xs font-semibold ${balance >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {balance >= 0 ? '+' : ''}{balance.toFixed(2)} PLN
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs + search */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800/50 rounded-2xl">
          {(['expenses', 'settlements'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {tab === 'expenses' ? `Wydatki (${expenses.length})` : 'Rozliczenia'}
            </button>
          ))}
        </div>

        {activeTab === 'expenses' && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Szukaj wydatków..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 rounded-3xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : activeTab === 'expenses' ? (
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
            <Receipt className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {search ? `Wyniki dla "${search}"` : 'Wszystkie wydatki'}
            </h2>
          </div>
          {filteredExpenses.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              {search ? 'Brak wyników wyszukiwania.' : 'Brak wydatków w tej grupie.'}
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredExpenses.map((exp) => (
                <div
                  key={exp.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <Receipt className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{exp.description}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(exp.date).toLocaleDateString('pl-PL')} · zapłacił/a {exp.paidBy.name.split(' ')[0]}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {Number(exp.amount).toFixed(2)} PLN
                    </p>
                    {exp.paidBy.id === currentUserId && (
                      <button
                        onClick={() => handleDelete(exp.id)}
                        disabled={deleting === exp.id}
                        className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                        title="Usuń wydatek"
                      >
                        {deleting === exp.id
                          ? <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin block" />
                          : <Trash2 className="w-4 h-4" />
                        }
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
            <ArrowRight className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Kto komu ile oddaje</h2>
          </div>
          {settlements.length === 0 ? (
            <div className="p-10 text-center text-gray-500">Wszyscy są rozliczeni! 🎉</div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {settlements.map((s, i) => {
                const isMe = s.from.id === currentUserId;
                return (
                  <div key={i} className={`px-6 py-5 flex items-center justify-between ${isMe ? 'bg-red-50/50 dark:bg-red-500/5' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400 text-xs font-bold">
                        {s.from.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {isMe ? 'Ty' : s.from.name.split(' ')[0]}
                          <span className="font-normal text-gray-500 dark:text-gray-400"> → </span>
                          {s.to.id === currentUserId ? 'Tobie' : s.to.name.split(' ')[0]}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {isMe ? 'Musisz oddać' : 'Oczekuje zwrotu'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg ${isMe ? 'text-red-600' : 'text-green-600'}`}>
                        {s.amount.toFixed(2)} PLN
                      </p>
                      {isMe && (
                        <button 
                          onClick={() => handleSettleUp(s)}
                          className="text-xs text-primary hover:underline font-medium mt-0.5"
                        >
                          Ureguluj
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
