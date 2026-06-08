import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthPage } from './AuthPage';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';

// Mock contexts
const mockLogin = jest.fn();
const mockRegister = jest.fn();
const mockSuccess = jest.fn();
const mockError = jest.fn();

const renderWithContexts = () => {
  return render(
    <AuthContext.Provider value={{
      user: null,
      token: null,
      login: mockLogin,
      register: mockRegister,
      logout: jest.fn(),
      isAuthenticated: false
    }}>
      <ToastContext.Provider value={{
        success: mockSuccess,
        error: mockError,
        info: jest.fn(),
        warning: jest.fn()
      }}>
        <AuthPage />
      </ToastContext.Provider>
    </AuthContext.Provider>
  );
};

describe('AuthPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render login form by default', () => {
    renderWithContexts();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Hasło')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /zaloguj się/i })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Imię i nazwisko')).not.toBeInTheDocument();
  });

  it('should switch to register mode when "Zarejestruj się" is clicked', () => {
    renderWithContexts();
    
    const registerTab = screen.getByRole('button', { name: /zarejestruj się/i });
    fireEvent.click(registerTab);
    
    expect(screen.getByPlaceholderText('Imię i nazwisko')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /utwórz konto/i })).toBeInTheDocument();
  });

  it('should call login function on submit in login mode', async () => {
    renderWithContexts();
    
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Hasło'), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getAllByRole('button', { name: /zaloguj się/i })[1]); // The submit button
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockSuccess).toHaveBeenCalledWith('Zalogowano pomyślnie!');
    });
  });

  it('should show error if login fails', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));
    renderWithContexts();
    
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Hasło'), { target: { value: 'wrongpass' } });
    
    fireEvent.click(screen.getAllByRole('button', { name: /zaloguj się/i })[1]);
    
    await waitFor(() => {
      expect(mockError).toHaveBeenCalledWith('Invalid credentials');
    });
  });

  it('should call register function on submit in register mode', async () => {
    renderWithContexts();
    
    fireEvent.click(screen.getByRole('button', { name: /zarejestruj się/i }));
    
    fireEvent.change(screen.getByPlaceholderText('Imię i nazwisko'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Hasło'), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /utwórz konto/i }));
    
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('John Doe', 'john@example.com', 'password123');
      expect(mockSuccess).toHaveBeenCalledWith('Konto zostało utworzone!');
    });
  });
});
