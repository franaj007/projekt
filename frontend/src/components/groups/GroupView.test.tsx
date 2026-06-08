import { render, screen, waitFor } from '@testing-library/react';
import { GroupView } from './GroupView';
import * as api from '../../api';

// Mock the API
jest.mock('../../api', () => ({
  fetchExpenses: jest.fn(),
  fetchSettlements: jest.fn(),
  deleteExpense: jest.fn(),
}));

const mockGroup = {
  id: '1',
  name: 'Test Group',
  createdAt: new Date().toISOString(),
  members: [
    {
      user: { id: 'u1', name: 'Alice Adams', email: 'alice@example.com' },
      joinedAt: new Date().toISOString(),
    },
    {
      user: { id: 'u2', name: 'Bob Brown', email: 'bob@example.com' },
      joinedAt: new Date().toISOString(),
    }
  ]
};

const mockExpenses = [
  {
    id: 'e1',
    description: 'Dinner',
    amount: '100.00',
    date: new Date().toISOString(),
    paidBy: { id: 'u1', name: 'Alice Adams' }
  }
];

const mockSettlementData = {
  balances: [
    { userId: 'u1', balance: 50 },
    { userId: 'u2', balance: -50 }
  ],
  settlements: [
    {
      from: { id: 'u2', name: 'Bob Brown' },
      to: { id: 'u1', name: 'Alice Adams' },
      amount: 50
    }
  ]
};

describe('GroupView Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading skeleton initially', () => {
    (api.fetchExpenses as jest.Mock).mockReturnValue(new Promise(() => {}));
    (api.fetchSettlements as jest.Mock).mockReturnValue(new Promise(() => {}));

    render(
      <GroupView 
        group={mockGroup as any} 
        currentUserId="u1" 
        onBack={jest.fn()} 
      />
    );

    expect(screen.getByText('Test Group')).toBeInTheDocument();
    expect(screen.getByText(/2 członków/)).toBeInTheDocument();
  });

  it('loads and displays expenses', async () => {
    (api.fetchExpenses as jest.Mock).mockResolvedValue(mockExpenses);
    (api.fetchSettlements as jest.Mock).mockResolvedValue(mockSettlementData);

    render(
      <GroupView 
        group={mockGroup as any} 
        currentUserId="u1" 
        onBack={jest.fn()} 
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Dinner')).toBeInTheDocument();
      expect(screen.getByText(/100.00 PLN/)).toBeInTheDocument();
    });
  });

  it('loads and displays members with balances', async () => {
    (api.fetchExpenses as jest.Mock).mockResolvedValue(mockExpenses);
    (api.fetchSettlements as jest.Mock).mockResolvedValue(mockSettlementData);

    render(
      <GroupView 
        group={mockGroup as any} 
        currentUserId="u1" 
        onBack={jest.fn()} 
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Alice (Ty)')).toBeInTheDocument();
      expect(screen.getByText('+50.00 PLN')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('-50.00 PLN')).toBeInTheDocument();
    });
  });
});
