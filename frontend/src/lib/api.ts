const API_URL = '/api';

function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

interface FetchOptions extends RequestInit {
  data?: any;
}

async function fetchWithAuth(endpoint: string, options: FetchOptions = {}) {
  const { data, headers: customHeaders, ...customConfig } = options;
  const token = getAuthToken();

  const config: RequestInit = {
    method: data ? 'POST' : 'GET',
    body: data ? JSON.stringify(data) : undefined,
    headers: {
      ...(data ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...customHeaders,
    },
    ...customConfig,
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  
  if (response.status === 401) {
    // Handle unauthorized (e.g., clear token and redirect to login)
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  const responseData = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(responseData?.error || 'Wystąpił błąd podczas komunikacji z serwerem');
    return Promise.reject(error);
  }

  return responseData;
}

export const api = {
  // Auth
  login: (data: any) => fetchWithAuth('/users/login', { data }),
  register: (data: any) => fetchWithAuth('/users/register', { data }),
  
  // Groups
  getGroups: () => fetchWithAuth('/groups'),
  createGroup: (data: any) => fetchWithAuth('/groups', { data }),
  
  // Expenses
  getExpenses: (groupId: string) => fetchWithAuth(`/expenses/group/${groupId}`),
  createExpense: (data: any) => fetchWithAuth('/expenses', { data }),
  
  // Settlements
  getSettlements: (groupId: string) => fetchWithAuth(`/settlements/${groupId}`)
};
