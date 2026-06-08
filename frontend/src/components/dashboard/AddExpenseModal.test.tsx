import { expect, test, describe, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddExpenseModal } from './AddExpenseModal';

// Mock api
vi.mock('../../api', () => ({
  addExpense: vi.fn().mockResolvedValue({ id: 'new-exp', description: 'Test', amount: 100 }),
}));

const mockGroups = [
  { id: 'g1', name: 'Mieszkanie', createdAt: '', members: [] },
];

const mockUsers = [
  { id: 'u1', name: 'Jan Kowalski', email: 'jan@example.com' },
  { id: 'u2', name: 'Marta Nowak', email: 'marta@example.com' },
];

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  groups: mockGroups,
  users: mockUsers,
  onExpenseAdded: vi.fn(),
};

describe('AddExpenseModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('does not render when isOpen is false', () => {
    render(<AddExpenseModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Dodaj wydatek')).toBeNull();
  });

  test('renders modal heading when open', () => {
    render(<AddExpenseModal {...defaultProps} />);
    expect(screen.getByRole('heading', { name: /dodaj wydatek/i })).toBeDefined();
  });

  test('renders all form fields', () => {
    render(<AddExpenseModal {...defaultProps} />);
    expect(screen.getByPlaceholderText(/czynsz/i)).toBeDefined();
    expect(screen.getByPlaceholderText('0.00')).toBeDefined();
    expect(screen.getByText('Podziel równo')).toBeDefined();
  });

  test('shows validation error when submitting empty form', async () => {
    render(<AddExpenseModal {...defaultProps} />);
    const submitBtn = screen.getByRole('button', { name: /dodaj wydatek/i });
    fireEvent.click(submitBtn);

    // Validation error should appear
    const error = await screen.findByText(/prawidłową kwotę/i);
    expect(error).toBeDefined();
  });

  test('calls onClose when Anuluj is clicked', () => {
    const onClose = vi.fn();
    render(<AddExpenseModal {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /anuluj/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('renders both group and payer selects with correct options', () => {
    render(<AddExpenseModal {...defaultProps} />);
    expect(screen.getByText('Mieszkanie')).toBeDefined();
    // Both user names appear in payer select + split select
    const janOptions = screen.getAllByText('Jan Kowalski');
    expect(janOptions.length).toBeGreaterThanOrEqual(1);
  });
});
