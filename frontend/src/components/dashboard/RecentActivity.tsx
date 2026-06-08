import React from 'react';
import { ShoppingBag, Coffee, Car, Home, Wallet } from 'lucide-react';

interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  paidBy: {
    id: string;
    name: string;
  };
  splits: any[];
}

interface RecentActivityProps {
  expenses: Expense[];
  loading: boolean;
}

export function RecentActivity({ expenses, loading }: RecentActivityProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 overflow-hidden min-h-[300px]">
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Ostatnie Wydatki</h2>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Ładowanie danych...</div>
        ) : expenses.length === 0 ? (
           <div className="p-8 text-center text-gray-500">Brak widocznych wydatków.</div>
        ) : (
          expenses.map((activity) => (
            <div key={activity.id} className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-gray-900 dark:text-white font-medium">{activity.description}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(activity.date).toLocaleDateString()} • {activity.paidBy.name}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {activity.amount} PLN
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Zapłacono przez {activity.paidBy.name.split(' ')[0]}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
