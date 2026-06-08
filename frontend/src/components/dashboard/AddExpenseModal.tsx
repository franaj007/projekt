import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { type Group, type User, addExpense } from '../../api';

const CATEGORIES = [
  { id: 'housing',   label: 'Mieszkanie', emoji: '🏠' },
  { id: 'food',      label: 'Jedzenie',   emoji: '🍕' },
  { id: 'transport', label: 'Transport',  emoji: '🚗' },
  { id: 'fun',       label: 'Rozrywka',   emoji: '🎉' },
  { id: 'health',    label: 'Zdrowie',    emoji: '💊' },
  { id: 'other',     label: 'Inne',       emoji: '💸' },
] as const;

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: Group[];
  users: User[];
  onExpenseAdded: () => void;
}

export function AddExpenseModal({
  isOpen,
  onClose,
  groups,
  users,
  onExpenseAdded,
}: AddExpenseModalProps) {
  const [groupId, setGroupId] = useState(groups[0]?.id ?? '');
  const [paidById, setPaidById] = useState(users[0]?.id ?? '');
  const [category, setCategory] = useState<string>(CATEGORIES[0].id);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [splits, setSplits] = useState<Array<{ userId: string; amount: string }>>([
    { userId: users[0]?.id ?? '', amount: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddSplit = () =>
    setSplits((prev) => [...prev, { userId: users[0]?.id ?? '', amount: '' }]);

  const handleRemoveSplit = (index: number) =>
    setSplits((prev) => prev.filter((_, i) => i !== index));

  const handleSplitChange = (
    index: number,
    field: 'userId' | 'amount',
    value: string,
  ) => {
    setSplits((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    );
  };

  const handleEvenSplit = () => {
    const num = splits.length;
    if (!amount || num === 0) return;
    const share = (parseFloat(amount) / num).toFixed(2);
    setSplits((prev) => prev.map((s) => ({ ...s, amount: share })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsedAmount = parseFloat(amount);
    if (!description.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Wypełnij opis i podaj prawidłową kwotę.');
      return;
    }
    const parsedSplits = splits.map((s) => ({
      userId: s.userId,
      amount: parseFloat(s.amount),
    }));
    if (parsedSplits.some((s) => isNaN(s.amount) || s.amount <= 0)) {
      setError('Każda część podziału musi mieć prawidłową kwotę.');
      return;
    }
    const total = parsedSplits.reduce((sum, s) => sum + s.amount, 0);
    if (Math.abs(total - parsedAmount) > 0.01) {
      setError(`Suma podziałów (${total.toFixed(2)}) musi być równa kwocie (${parsedAmount.toFixed(2)}).`);
      return;
    }
    try {
      setLoading(true);
      await addExpense({ groupId, paidById, amount: parsedAmount, description, splits: parsedSplits });
      setDescription('');
      setAmount('');
      setCategory(CATEGORIES[0].id);
      setSplits([{ userId: users[0]?.id ?? '', amount: '' }]);
      onExpenseAdded();
      onClose();
    } catch (err: any) {
      setError(err.message ?? 'Nie udało się dodać wydatku.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Dodaj wydatek</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Podziel koszty ze znajomymi</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Group */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Grupa
            </label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Kategoria
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                    category === cat.id
                      ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Opis
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="np. Kolacja, Zakupy, Paliwo..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Amount + Paid by */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Kwota (PLN)
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Kto zapłacił
              </label>
              <select
                value={paidById}
                onChange={(e) => setPaidById(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Splits */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Podział
              </label>
              <button
                type="button"
                onClick={handleEvenSplit}
                className="text-xs text-primary hover:underline font-medium"
              >
                Podziel równo
              </button>
            </div>
            <div className="space-y-2">
              {splits.map((split, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select
                    value={split.userId}
                    onChange={(e) => handleSplitChange(i, 'userId', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={split.amount}
                    onChange={(e) => handleSplitChange(i, 'amount', e.target.value)}
                    placeholder="PLN"
                    className="w-28 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  {splits.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSplit(i)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddSplit}
              className="mt-2 flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Dodaj osobę</span>
            </button>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-500/10 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 text-white text-sm font-semibold transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              {loading ? 'Zapisuję…' : 'Dodaj wydatek'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
