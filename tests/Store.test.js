/**
 * VoxVision Frontend Tests — Store.js (orders, donations, PayHere redirect)
 * Run with: npm test
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import Store from '../../Pages/Store';
import * as api from '../../services/api';

jest.mock('../../services/api');

// Mock form.submit to prevent actual navigation in tests
HTMLFormElement.prototype.submit = jest.fn();

const mockUser = {
  id: 'u1', username: 'testuser', full_name: 'Test User',
  email: 'test@test.com', is_caregiver: false, created_at: ''
};

const renderStore = (isLoggedIn = true) => {
  if (isLoggedIn) {
    localStorage.setItem('vv_token', 'mock.jwt.token');
    localStorage.setItem('vv_user', JSON.stringify(mockUser));
  }
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Store darkMode={false} toggleDarkMode={() => {}} />
      </AuthProvider>
    </BrowserRouter>
  );
};

afterEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
  HTMLFormElement.prototype.submit.mockClear();
});

// ── Shop Tab Tests ─────────────────────────────────────────────────────────

describe('Store — Shop Tab', () => {
  test('renders product list', () => {
    renderStore();
    expect(screen.getByText(/VoxVision NFC Tag Pack \(10 stickers\)/i)).toBeInTheDocument();
    expect(screen.getByText(/VoxVision NFC Tag Pack \(50 stickers\)/i)).toBeInTheDocument();
    expect(screen.getByText(/VoxVision Starter Kit/i)).toBeInTheDocument();
  });

  test('total updates when quantity changes', () => {
    renderStore();
    const qtyInput = screen.getByDisplayValue('1');
    fireEvent.change(qtyInput, { target: { value: '3' } });
    expect(screen.getByText(/1,050/)).toBeInTheDocument(); // 350 × 3
  });

  test('shows login prompt when not authenticated', () => {
    renderStore(false);
    expect(screen.getByText(/log in/i)).toBeInTheDocument();
  });

  test('redirects to PayHere on successful order creation', async () => {
    api.createOrder.mockResolvedValueOnce({
      data: {
        id: 'order-uuid-123',
        product_name: 'VoxVision NFC Tag Pack (10 stickers)',
        quantity: 1,
        unit_price: 350,
        total_amount: 350,
        status: 'pending',
      }
    });

    renderStore();
    fireEvent.change(screen.getByPlaceholderText(/07XXXXXXXX/i),
      { target: { value: '0771234567' } });
    fireEvent.change(screen.getByPlaceholderText(/full postal address/i),
      { target: { value: 'No 1, Main Street, Colombo 03' } });
    fireEvent.click(screen.getByRole('button', { name: /pay with payhere/i }));

    await waitFor(() => {
      expect(api.createOrder).toHaveBeenCalledTimes(1);
      // PayHere form should have been submitted
      expect(HTMLFormElement.prototype.submit).toHaveBeenCalled();
    });
  });

  test('shows error when address is missing', async () => {
    renderStore();
    fireEvent.click(screen.getByRole('button', { name: /pay with payhere/i }));
    await waitFor(() => {
      expect(screen.getByText(/please enter a shipping address/i)).toBeInTheDocument();
    });
  });

  test('shows API error on order failure', async () => {
    api.createOrder.mockRejectedValueOnce({
      response: { data: { detail: 'Insufficient stock.' } }
    });

    renderStore();
    fireEvent.change(screen.getByPlaceholderText(/full postal address/i),
      { target: { value: 'No 1, Main Street, Colombo 03' } });
    fireEvent.click(screen.getByRole('button', { name: /pay with payhere/i }));

    await waitFor(() => {
      expect(screen.getByText(/insufficient stock/i)).toBeInTheDocument();
    });
  });
});

// ── Donate Tab Tests ───────────────────────────────────────────────────────

describe('Store — Donate Tab', () => {
  const switchToDonate = () =>
    fireEvent.click(screen.getByRole('button', { name: /donate/i }));

  test('renders donation form', () => {
    renderStore();
    switchToDonate();
    expect(screen.getByPlaceholderText(/full name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your@email.com/i)).toBeInTheDocument();
  });

  test('quick amount buttons populate amount field', () => {
    renderStore();
    switchToDonate();
    fireEvent.click(screen.getByRole('button', { name: '1,000' }));
    expect(screen.getByDisplayValue('1000')).toBeInTheDocument();
  });

  test('redirects to PayHere on successful donation', async () => {
    api.createDonation.mockResolvedValueOnce({
      data: {
        id: 'donation-uuid-456',
        donor_name: 'Nimal',
        donor_email: 'nimal@test.com',
        amount: 500,
        status: 'pending',
      }
    });

    renderStore();
    switchToDonate();

    fireEvent.change(screen.getByPlaceholderText(/full name/i),
      { target: { value: 'Nimal Perera' } });
    fireEvent.change(screen.getByPlaceholderText(/your@email.com/i),
      { target: { value: 'nimal@test.com' } });
    fireEvent.change(screen.getByPlaceholderText(/or enter custom amount/i),
      { target: { value: '500' } });
    fireEvent.click(screen.getByRole('button', { name: /donate with payhere/i }));

    await waitFor(() => {
      expect(api.createDonation).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 500 })
      );
      expect(HTMLFormElement.prototype.submit).toHaveBeenCalled();
    });
  });

  test('shows error when required fields missing', async () => {
    renderStore();
    switchToDonate();
    fireEvent.click(screen.getByRole('button', { name: /donate with payhere/i }));
    await waitFor(() => {
      expect(screen.getByText(/please fill in all required fields/i)).toBeInTheDocument();
    });
  });
});

// ── Payment Return Banner Tests ────────────────────────────────────────────

describe('Store — Payment Return Banners', () => {
  test('shows success banner when ?payment=success', () => {
    window.history.pushState({}, '', '/store?payment=success');
    renderStore();
    expect(screen.getByText(/payment successful/i)).toBeInTheDocument();
  });

  test('shows cancelled banner when ?payment=cancelled', () => {
    window.history.pushState({}, '', '/store?payment=cancelled');
    renderStore();
    expect(screen.getByText(/payment was cancelled/i)).toBeInTheDocument();
  });
});
