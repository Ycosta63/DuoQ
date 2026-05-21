import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, vi, describe, beforeEach } from 'vitest';
import { Login } from './Login';
import * as AuthContext from '../contexts/AuthContext';

// Mock the AuthContext wrapper
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('Login Component', () => {
  let mockLogin: any;
  let mockRegister: any;

  beforeEach(() => {
    mockLogin = vi.fn().mockResolvedValue({});
    mockRegister = vi.fn().mockResolvedValue({});
    
    (AuthContext.useAuth as any).mockReturnValue({
      login: mockLogin,
      register: mockRegister,
      loading: false,
    });
  });

  test('renders login form by default', () => {
    render(<Login />);
    expect(screen.getByText('Identifiants')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Pseudo IG ou Email')).toBeInTheDocument();
  });

  test('calls login with correct credentials', async () => {
    render(<Login />);
    
    const identifierInput = screen.getByPlaceholderText('Pseudo IG ou Email');
    const passwordInput = screen.getByPlaceholderText('Mot de passe');
    const submitBtn = screen.getByRole('button', { name: /Connecter/i });

    fireEvent.change(identifierInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    fireEvent.submit(identifierInput.closest('form')!);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
    });
  });

  test('shows error when login fails', async () => {
    mockLogin.mockResolvedValue({ error: 'Mot de passe incorrect' });
    
    render(<Login />);
    
    const identifierInput = screen.getByPlaceholderText('Pseudo IG ou Email');
    const passwordInput = screen.getByPlaceholderText('Mot de passe');
    const submitBtn = screen.getByRole('button', { name: /Connecter/i });

    fireEvent.change(identifierInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    
    fireEvent.submit(identifierInput.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('Mot de passe incorrect')).toBeInTheDocument();
    });
  });

  test('switches to register view and validates age', async () => {
    render(<Login />);
    
    // Switch to register
    fireEvent.click(screen.getByText("S'inscrire"));
    
    const pseudoInput = screen.getByPlaceholderText('Pseudo IG');
    const emailInput = screen.getByPlaceholderText('Adresse Email');
    const passwordInput = screen.getByPlaceholderText('Mot de passe');
    const submitBtn = screen.getByRole('button', { name: /Continuer/i });

    fireEvent.change(pseudoInput, { target: { value: 'newuser' } });
    fireEvent.change(emailInput, { target: { value: 'new@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'pass123' } });
    
    // Do not check adult checkbox
    fireEvent.submit(pseudoInput.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('Vous devez avoir plus de 18 ans pour vous inscrire.')).toBeInTheDocument();
    });
  });
});
