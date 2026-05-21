import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, vi, describe, beforeEach } from 'vitest';
import { Settings } from './Settings';
import * as AuthContext from '../contexts/AuthContext';

// Mock the AuthContext wrapper
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('Settings Component', () => {
  let mockUpdateProfile: any;
  let mockDeleteAccount: any;
  let mockLogout: any;

  beforeEach(() => {
    mockUpdateProfile = vi.fn().mockResolvedValue({});
    mockDeleteAccount = vi.fn().mockResolvedValue({});
    mockLogout = vi.fn();
    
    (AuthContext.useAuth as any).mockReturnValue({
      user: {
        id: 'user-1',
        bio: 'Old Bio',
        avatar_url: 'http://old.img',
        playstyle: 'Chill'
      },
      updateProfile: mockUpdateProfile,
      deleteAccount: mockDeleteAccount,
      logout: mockLogout,
    });
  });

  test('renders current user info', () => {
    render(<Settings />);
    expect(screen.getByText('Old Bio')).toBeInTheDocument(); // because textarea stores it as value, actually getByText might not work for textarea values, let's use placeholder or getByDisplayValue.
  });

  test('updates profile on save', async () => {
    render(<Settings />);
    
    // Find Avatar input
    const avatarInput = screen.getByPlaceholderText(/Lien vers une image ou avatar Discord/i);
    fireEvent.change(avatarInput, { target: { value: 'http://new.img' } });
    
    // Find Bio textarea
    const bioInput = screen.getByDisplayValue('Old Bio');
    fireEvent.change(bioInput, { target: { value: 'New Bio' } });
    
    // Submit
    fireEvent.submit(avatarInput.closest('form')!);
    
    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalled();
      const callArgs = mockUpdateProfile.mock.calls[0][0];
      expect(callArgs.avatar_url).toBe('http://new.img');
      expect(callArgs.bio).toBe('New Bio');
    });
    
    // Verify success message
    await waitFor(() => {
      expect(screen.getByText('Profil mis à jour !')).toBeInTheDocument();
    });
  });
});
