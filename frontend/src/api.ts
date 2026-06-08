const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

// ── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Group {
  id: string;
  name: string;
  createdAt: string;
  members: Array<{ id: string; user: User }>;
}

export interface ExpenseSplit {
  id: string;
  userId: string;
  amount: number;
  user?: User;
}

export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  date: string;
  paidById: string;
  paidBy: User;
  splits: ExpenseSplit[];
}

export interface SettlementBalance {
  userId: string;
  name: string;
  balance: number;
}

export interface Settlement {
  from: { id: string; name: string };
  to: { id: string; name: string };
  amount: number;
}

export interface SettlementsResponse {
  groupId: string;
  groupName: string;
  balances: SettlementBalance[];
  settlements: Settlement[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('splitpay_token');
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${response.status}`);
  }
  // 204 No Content has no body
  if (response.status === 204) return undefined as unknown as T;
  return response.json() as Promise<T>;
}

// ── Users ────────────────────────────────────────────────────────────────────

export const fetchUsers = () => apiFetch<User[]>('/users');

export const registerUser = (data: { name: string; email: string; password: string }) =>
  apiFetch<{ user: User; token: string }>('/users/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const loginUser = (data: { email: string; password: string }) =>
  apiFetch<{ user: User; token: string }>('/users/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });

// ── Groups ───────────────────────────────────────────────────────────────────

export const fetchGroups = () => apiFetch<Group[]>('/groups');

export const createGroup = (data: { name: string; userIds: string[] }) =>
  apiFetch<Group>('/groups', { method: 'POST', body: JSON.stringify(data) });

export const deleteGroup = (id: string) =>
  apiFetch<void>(`/groups/${id}`, { method: 'DELETE' });

// ── Expenses ─────────────────────────────────────────────────────────────────

export const fetchExpenses = (groupId: string) =>
  apiFetch<Expense[]>(`/expenses/group/${groupId}`);

export const addExpense = (data: {
  groupId: string;
  paidById: string;
  amount: number;
  description: string;
  splits: Array<{ userId: string; amount: number }>;
}) => apiFetch<Expense>('/expenses', { method: 'POST', body: JSON.stringify(data) });

export const deleteExpense = (id: string) =>
  apiFetch<void>(`/expenses/${id}`, { method: 'DELETE' });

// ── Settlements ───────────────────────────────────────────────────────────────

export const fetchSettlements = (groupId: string) =>
  apiFetch<SettlementsResponse>(`/settlements/${groupId}`);
