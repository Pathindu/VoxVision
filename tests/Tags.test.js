/**
 * VoxVision Frontend Tests — TagWriter.js & TagScanner.js
 * Run with: npm test
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import TagWriter from '../../Pages/TagWriter';
import TagScanner from '../../Pages/TagScanner';
import * as api from '../../services/api';

jest.mock('../../services/api');

const caregiverUser = {
  id: 'cg1', username: 'caregiver1', full_name: 'Caregiver',
  email: 'cg@test.com', is_caregiver: true, created_at: ''
};

const standardUser = {
  id: 'u1', username: 'stduser', full_name: 'Standard',
  email: 'std@test.com', is_caregiver: false, created_at: ''
};

const setupAsCaregiver = () => {
  localStorage.setItem('vv_token', 'mock.jwt.token');
  localStorage.setItem('vv_user', JSON.stringify(caregiverUser));
};

const setupAsStandard = () => {
  localStorage.setItem('vv_token', 'mock.jwt.token');
  localStorage.setItem('vv_user', JSON.stringify(standardUser));
};

afterEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

// ── TagWriter Tests ────────────────────────────────────────────────────────

describe('TagWriter', () => {
  const renderTagWriter = () => {
    setupAsCaregiver();
    api.getMyTags.mockResolvedValue({ data: [] });
    return render(
      <BrowserRouter>
        <AuthProvider>
          <TagWriter darkMode={false} toggleDarkMode={() => {}} />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  test('renders tag description input', () => {
    renderTagWriter();
    expect(screen.getByPlaceholderText(/this is the bathroom door/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save to server/i })).toBeInTheDocument();
  });

  test('shows character count', () => {
    renderTagWriter();
    const textarea = screen.getByPlaceholderText(/this is the bathroom door/i);
    fireEvent.change(textarea, { target: { value: 'Hello door' } });
    expect(screen.getByText(/10\/2000/)).toBeInTheDocument();
  });

  test('creates tag and shows ID on success', async () => {
    api.createTag.mockResolvedValueOnce({
      data: { id: 'A3BX92KP', description: 'Front door', owner_id: 'cg1',
              created_at: '', updated_at: '' }
    });
    api.getMyTags.mockResolvedValue({ data: [] });

    renderTagWriter();
    const textarea = screen.getByPlaceholderText(/this is the bathroom door/i);
    fireEvent.change(textarea, { target: { value: 'Front door' } });
    fireEvent.click(screen.getByRole('button', { name: /save to server/i }));

    await waitFor(() => {
      expect(screen.getByText(/A3BX92KP/)).toBeInTheDocument();
      expect(screen.getByText(/tag saved/i)).toBeInTheDocument();
    });
  });

  test('shows NFC write button when NDEFReader is available', async () => {
    // Mock Web NFC API
    global.window.NDEFReader = jest.fn();
    api.createTag.mockResolvedValueOnce({
      data: { id: 'A3BX92KP', description: 'Test', owner_id: 'cg1',
              created_at: '', updated_at: '' }
    });
    api.getMyTags.mockResolvedValue({ data: [] });

    renderTagWriter();
    fireEvent.change(screen.getByPlaceholderText(/this is the bathroom door/i),
      { target: { value: 'Test description' } });
    fireEvent.click(screen.getByRole('button', { name: /save to server/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /write to nfc sticker/i })).toBeInTheDocument();
    });
    delete global.window.NDEFReader;
  });

  test('shows manual URL when NFC not supported', async () => {
    delete global.window.NDEFReader;
    api.createTag.mockResolvedValueOnce({
      data: { id: 'A3BX92KP', description: 'Test', owner_id: 'cg1',
              created_at: '', updated_at: '' }
    });
    api.getMyTags.mockResolvedValue({ data: [] });

    renderTagWriter();
    fireEvent.change(screen.getByPlaceholderText(/this is the bathroom door/i),
      { target: { value: 'Test description' } });
    fireEvent.click(screen.getByRole('button', { name: /save to server/i }));

    await waitFor(() => {
      expect(screen.getByText(/manually program/i)).toBeInTheDocument();
      expect(screen.getByText(/A3BX92KP/)).toBeInTheDocument();
    });
  });

  test('shows existing tags list', async () => {
    api.getMyTags.mockResolvedValue({
      data: [
        { id: 'TAG00001', description: 'Kitchen door', owner_id: 'cg1',
          created_at: '', updated_at: '' },
        { id: 'TAG00002', description: 'Bathroom door', owner_id: 'cg1',
          created_at: '', updated_at: '' },
      ]
    });

    renderTagWriter();
    await waitFor(() => {
      expect(screen.getByText('Kitchen door')).toBeInTheDocument();
      expect(screen.getByText('Bathroom door')).toBeInTheDocument();
    });
  });
});

// ── TagScanner Tests ───────────────────────────────────────────────────────

describe('TagScanner', () => {
  const renderScanner = (tagId) => render(
    <MemoryRouter initialEntries={[`/scan/${tagId}`]}>
      <AuthProvider>
        <Routes>
          <Route path="/scan/:tagId" element={
            <TagScanner darkMode={false} toggleDarkMode={() => {}} />
          } />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );

  test('shows loading state initially', () => {
    api.getTag.mockReturnValue(new Promise(() => {})); // never resolves
    renderScanner('A3BX92KP');
    expect(screen.getByText(/loading tag/i)).toBeInTheDocument();
  });

  test('displays description after successful fetch', async () => {
    api.getTag.mockResolvedValueOnce({
      data: { id: 'A3BX92KP', description: 'This is the front door.' }
    });

    renderScanner('A3BX92KP');
    await waitFor(() => {
      expect(screen.getByText('This is the front door.')).toBeInTheDocument();
    });
  });

  test('shows 404 message for unknown tag', async () => {
    api.getTag.mockRejectedValueOnce({
      response: { status: 404 }
    });

    renderScanner('NOTEXIST');
    await waitFor(() => {
      expect(screen.getByText(/tag has not been programmed/i)).toBeInTheDocument();
    });
  });

  test('shows Play Again button after load', async () => {
    api.getTag.mockResolvedValueOnce({
      data: { id: 'A3BX92KP', description: 'Front door description.' }
    });

    renderScanner('A3BX92KP');
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /play again/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument();
    });
  });

  test('shows tag ID on the page', async () => {
    api.getTag.mockResolvedValueOnce({
      data: { id: 'A3BX92KP', description: 'Kitchen door.' }
    });

    renderScanner('A3BX92KP');
    await waitFor(() => {
      expect(screen.getByText(/A3BX92KP/)).toBeInTheDocument();
    });
  });
});
