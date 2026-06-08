import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateGroupModal } from './CreateGroupModal';
import * as api from '../../api';

// Mock the API calls
jest.mock('../../api', () => ({
  createGroup: jest.fn(),
}));

const mockUsers = [
  { id: '1', name: 'Alice Adams', email: 'alice@example.com' },
  { id: '2', name: 'Bob Brown', email: 'bob@example.com' },
];

describe('CreateGroupModal', () => {
  const mockOnClose = jest.fn();
  const mockOnGroupCreated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(
      <CreateGroupModal 
        isOpen={false} 
        onClose={mockOnClose} 
        users={mockUsers} 
        onGroupCreated={mockOnGroupCreated} 
      />
    );
    expect(screen.queryByText('Nowa grupa')).not.toBeInTheDocument();
  });

  it('renders correctly when isOpen is true', () => {
    render(
      <CreateGroupModal 
        isOpen={true} 
        onClose={mockOnClose} 
        users={mockUsers} 
        onGroupCreated={mockOnGroupCreated} 
      />
    );
    expect(screen.getByText('Nowa grupa')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('np. Mieszkanie, Wyjazd w góry...')).toBeInTheDocument();
    expect(screen.getByText('Alice Adams')).toBeInTheDocument();
    expect(screen.getByText('Bob Brown')).toBeInTheDocument();
  });

  it('shows error if name is empty', async () => {
    render(
      <CreateGroupModal 
        isOpen={true} 
        onClose={mockOnClose} 
        users={mockUsers} 
        onGroupCreated={mockOnGroupCreated} 
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: /utwórz grupę/i }));
    
    expect(await screen.findByText('Podaj nazwę grupy.')).toBeInTheDocument();
    expect(api.createGroup).not.toHaveBeenCalled();
  });

  it('shows error if no members selected', async () => {
    render(
      <CreateGroupModal 
        isOpen={true} 
        onClose={mockOnClose} 
        users={mockUsers} 
        onGroupCreated={mockOnGroupCreated} 
      />
    );
    
    fireEvent.change(screen.getByPlaceholderText('np. Mieszkanie, Wyjazd w góry...'), { target: { value: 'Test Group' } });
    fireEvent.click(screen.getByRole('button', { name: /utwórz grupę/i }));
    
    expect(await screen.findByText('Wybierz co najmniej jednego członka.')).toBeInTheDocument();
    expect(api.createGroup).not.toHaveBeenCalled();
  });

  it('creates group and closes modal on success', async () => {
    (api.createGroup as jest.Mock).mockResolvedValueOnce({ id: '123', name: 'Test Group' });

    render(
      <CreateGroupModal 
        isOpen={true} 
        onClose={mockOnClose} 
        users={mockUsers} 
        onGroupCreated={mockOnGroupCreated} 
      />
    );
    
    fireEvent.change(screen.getByPlaceholderText('np. Mieszkanie, Wyjazd w góry...'), { target: { value: 'Test Group' } });
    
    // Select a user
    fireEvent.click(screen.getByText('Alice Adams'));
    
    fireEvent.click(screen.getByRole('button', { name: /utwórz grupę/i }));
    
    expect(screen.getByText('Tworzę…')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(api.createGroup).toHaveBeenCalledWith({ name: 'Test Group', userIds: ['1'] });
      expect(mockOnGroupCreated).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('displays API error message on failure', async () => {
    (api.createGroup as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(
      <CreateGroupModal 
        isOpen={true} 
        onClose={mockOnClose} 
        users={mockUsers} 
        onGroupCreated={mockOnGroupCreated} 
      />
    );
    
    fireEvent.change(screen.getByPlaceholderText('np. Mieszkanie, Wyjazd w góry...'), { target: { value: 'Test Group' } });
    fireEvent.click(screen.getByText('Bob Brown'));
    
    fireEvent.click(screen.getByRole('button', { name: /utwórz grupę/i }));
    
    expect(await screen.findByText('Network error')).toBeInTheDocument();
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
