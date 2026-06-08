import { expect, test, describe, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BalanceCards } from './BalanceCards';

// Mock api module so tests don't hit the network
vi.mock('../../api', () => ({
  fetchSettlements: vi.fn().mockResolvedValue({
    groupId: 'group1',
    groupName: 'Mieszkanie',
    balances: [
      { userId: 'user1', name: 'Jan Kowalski', balance: 124.5 },
      { userId: 'user2', name: 'Marta Nowak', balance: -45.0 },
    ],
    settlements: [
      { from: { id: 'user2', name: 'Marta Nowak' }, to: { id: 'user1', name: 'Jan Kowalski' }, amount: 45.0 },
    ],
  }),
}));

describe('BalanceCards Component', () => {
  test('renders all three balance section headings', () => {
    render(<BalanceCards groupId="group1" currentUserId="user1" />);

    expect(screen.getByText('Całkowity Bilans')).toBeDefined();
    expect(screen.getByText('Ty Wisisz')).toBeDefined();
    expect(screen.getByText('Wiszą Tobie')).toBeDefined();
  });

  test('renders skeleton loaders when no groupId is provided', () => {
    const { container } = render(<BalanceCards />);
    // Should render 3 animated placeholder divs
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBe(3);
  });

  test('renders Ureguluj action button', () => {
    render(<BalanceCards groupId="group1" currentUserId="user1" />);
    const button = screen.getByRole('button', { name: /ureguluj/i });
    expect(button).toBeDefined();
  });
});
