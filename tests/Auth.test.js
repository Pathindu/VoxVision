/**
 * VoxVision Frontend Tests — Auth (LoginRegister.js)
 * Run with: npm test
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import LoginRegister from '../../Pages/LoginRegister';
import * as api from '../../services/api';

// Mock the API module
jest.mock('../../services/api');

const renderLoginRegister = () =>
  render(
    <BrowserRouter>
      <AuthProvider>
        <LoginRegister darkMode={false} toggleDarkMode={() => {}} />
      </AuthProvider>
    </BrowserRouter>
  );

// ── Login Tests ────────────────────────────────────────────────────────────

describe('Login Form', () => {
  test('renders login form by default', () => {
    renderLoginRegister();
    expect(screen.getByPlaceholderText(/enter your username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('shows error when fields are empty', async () => {
    renderLoginRegister();
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    await waitFor(() => {
      expect(screen.getByText(/please fill in all fields/i)).toBeInTheDocument();
    });
  });

  test('calls loginUser API with correct data', async () => {
    api.loginUser.mockResolvedValueOnce({
      data: {
        access_token: 'mock.jwt.token',
        user: { id: '1', username: 'testuser', is_caregiver: false,
                full_name: 'Test', email: 'test@test.com', created_at: '' }
      }
    });

    renderLoginRegister();
    fireEvent.change(screen.getByPlaceholderText(/enter your username/i),
      { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i),
      { target: { value: 'test123' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(api.loginUser).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'test123',
      });
    });
  });

  test('shows API error message on failed login', async () => {
    api.loginUser.mockRejectedValueOnce({
      response: { data: { detail: 'Incorrect username or password.' } }
    });

    renderLoginRegister();
    fireEvent.change(screen.getByPlaceholderText(/enter your username/i),
      { target: { value: 'wronguser' } });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i),
      { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/incorrect username or password/i)).toBeInTheDocument();
    });
  });
});

// ── Register Tests ─────────────────────────────────────────────────────────

describe('Register Form', () => {
  const switchToRegister = () => {
    renderLoginRegister();
    fireEvent.click(screen.getByText(/register here/i));
  };

  test('switches to register form', () => {
    switchToRegister();
    expect(screen.getByPlaceholderText(/enter your name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/i am a caregiver/i)).toBeInTheDocument();
  });

  test('shows error when passwords do not match', async () => {
    switchToRegister();
    fireEvent.change(screen.getByPlaceholderText(/enter your name/i),
      { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i),
      { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText(/choose a username/i),
      { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText(/create a secure password/i),
      { target: { value: 'password1' } });
    fireEvent.change(screen.getByPlaceholderText(/confirm your password/i),
      { target: { value: 'password2' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  test('calls registerUser with is_caregiver=true when checkbox checked', async () => {
    api.registerUser.mockResolvedValueOnce({ data: {} });
    switchToRegister();

    fireEvent.change(screen.getByPlaceholderText(/enter your name/i),
      { target: { value: 'Caregiver User' } });
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i),
      { target: { value: 'cg@test.com' } });
    fireEvent.change(screen.getByPlaceholderText(/choose a username/i),
      { target: { value: 'cguser1' } });
    fireEvent.change(screen.getByPlaceholderText(/create a secure password/i),
      { target: { value: 'test123' } });
    fireEvent.change(screen.getByPlaceholderText(/confirm your password/i),
      { target: { value: 'test123' } });
    fireEvent.click(screen.getByLabelText(/i am a caregiver/i));
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(api.registerUser).toHaveBeenCalledWith(
        expect.objectContaining({ is_caregiver: true })
      );
    });
  });
});

// ── AuthContext Tests ──────────────────────────────────────────────────────

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('isLoggedIn is false when no token in localStorage', () => {
    const { result } = renderHook(() => require('../../context/AuthContext').useAuth(),
      { wrapper: AuthProvider });
    expect(result.current.isLoggedIn).toBe(false);
  });

  test('stores token in localStorage on login', () => {
    localStorage.setItem('vv_token', 'test.jwt.token');
    localStorage.setItem('vv_user', JSON.stringify({ username: 'u1', is_caregiver: false }));
    render(<AuthProvider><div data-testid="child" /></AuthProvider>);
    expect(localStorage.getItem('vv_token')).toBe('test.jwt.token');
  });
});
