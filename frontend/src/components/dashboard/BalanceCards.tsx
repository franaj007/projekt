import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Wallet, RefreshCw } from 'lucide-react';
import { fetchSettlements, type SettlementBalance, type Settlement } from '../../api';

interface BalanceCardsProps {
  groupId?: string;
  /** ID of the logged-in user — used to calculate personal balance from the response */
  currentUserId?: string;
}

export function BalanceCards({ groupId, currentUserId }: BalanceCardsProps) {
  const [balances, setBalances] = useState<SettlementBalance[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) return;
    setLoading(true);
    setError(null);
    fetchSettlements(groupId)
      .then((data) => {
        setBalances(data.balances);
        setSettlements(data.settlements);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [groupId]);

  // Derive current-user metrics
  const myBalance = balances.find((b) => b.userId === currentUserId);
  const totalBalance = myBalance?.balance ?? 0;
  const iOwe = settlements
    .filter((s) => s.from.id === currentUserId)
    .reduce((sum, s) => sum + s.amount, 0);
  const owedToMe = settlements
    .filter((s) => s.to.id === currentUserId)
    .reduce((sum, s) => sum + s.amount, 0);
  const waitingFromNames = settlements
    .filter((s) => s.to.id === currentUserId)
    .map((s) => s.from.name.split(' ')[0])
    .join(', ');

  // Skeleton / no-group state
  if (!groupId) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-40 rounded-3xl bg-gray-100 dark:bg-gray-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-40 rounded-3xl bg-gray-100 dark:bg-gray-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Balance Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 shadow-xl shadow-gray-900/20 group hover:-translate-y-1 transition-transform duration-300">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Wallet className="w-24 h-24 text-white group-hover:scale-110 transition-transform duration-500" />
        </div>
        <div className="relative z-10">
          <h3 className="text-gray-400 font-medium text-sm mb-2">Całkowity Bilans</h3>
          {error ? (
            <p className="text-sm text-red-400">{error}</p>
          ) : (
            <p
              className={`text-4xl font-bold mb-4 ${
                totalBalance >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {totalBalance >= 0 ? '+' : ''}
              {totalBalance.toFixed(2)} PLN
            </p>
          )}
          <div className="flex items-center space-x-2 text-sm">
            <span className="bg-white/10 text-white px-2.5 py-1 rounded-full backdrop-blur-md">
              {totalBalance >= 0 ? 'Na plusie' : 'Na minusie'}
            </span>
          </div>
        </div>
      </div>

      {/* You Owe Card */}
      <div className="relative overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm mb-1">Ty Wisisz</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {iOwe.toFixed(2)} PLN
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Owed to You Card */}
      <div className="relative overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm mb-1">Wiszą Tobie</h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-500">
              {owedToMe.toFixed(2)} PLN
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-500">
            <ArrowDownRight className="w-6 h-6" />
          </div>
        </div>
        {waitingFromNames && (
          <p className="text-xs text-gray-500 mt-4">
            Oczekujesz na zwroty od:{' '}
            <span className="font-semibold text-gray-700 dark:text-gray-300">{waitingFromNames}</span>
          </p>
        )}
      </div>
    </div>
  );
}
