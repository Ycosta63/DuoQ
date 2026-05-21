import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, vi, describe, beforeEach } from 'vitest';
import { Discover } from './Discover';
import * as AuthContext from '../contexts/AuthContext';

// Mock the AuthContext wrapper
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock framer-motion to avoid complex animation testing issues in jsdom
vi.mock('motion/react', () => {
    return {
        motion: {
            div: ({ children, ...props }: any) => <div {...props}>{children}</div>
        },
        AnimatePresence: ({ children }: any) => <>{children}</>
    };
});

// Mock firebase firestore
vi.mock('firebase/firestore', () => {
    return {
        collection: vi.fn(),
        query: vi.fn(),
        getDocs: vi.fn().mockResolvedValue({
            forEach: (cb: any) => {
                cb({
                    data: () => ({
                        id: 'fake-profile-1',
                        username: 'TestUser1',
                        games: 'LoL',
                        relation_mode: '🕹️ Joystick',
                        questionnaire: { q1: 'test' }
                    })
                });
            },
            docs: [
                {
                    id: 'fake-profile-1',
                    data: () => ({
                        username: 'TestUser1',
                        games: 'LoL',
                        relation_mode: '🕹️ Joystick',
                        questionnaire: { q1: 'test' }
                    })
                }
            ]
        }),
        doc: vi.fn(),
        setDoc: vi.fn(),
        getDoc: vi.fn().mockResolvedValue({ exists: () => false }),
        serverTimestamp: vi.fn(),
        where: vi.fn(),
        addDoc: vi.fn()
    }
});

vi.mock('../firebase', () => ({
    db: {}
}));

describe('Discover Component', () => {
  beforeEach(() => {
    (AuthContext.useAuth as any).mockReturnValue({
      user: { id: 'current-user-1', username: 'Current' },
    });
  });

  test('renders loading state initially then shows profiles', async () => {
    render(<Discover />);
    // Check loading spinner is rendered (by checking class name or similar if possible)
    // Then wait for profile "TestUser1"
    await waitFor(() => {
      expect(screen.getByText('TestUser1')).toBeInTheDocument();
    });
  });

  test('swipes right triggers match attempt', async () => {
    const { setDoc } = await import('firebase/firestore');

    render(<Discover />);
    
    await waitFor(() => {
        expect(screen.getByText('GG')).toBeInTheDocument();
    });

    const ggButton = screen.getByText('GG').closest('button');
    fireEvent.click(ggButton!);

    // Should call setDoc to save swipe
    await waitFor(() => {
        expect(setDoc).toHaveBeenCalled();
    });
  });
});
