import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Home from '../page';

// 1. Mock IntersectionObserver (Fixes the ReferenceError)
beforeAll(() => {
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
    takeRecords() { return []; }
    root = null;
    rootMargin = "";
    thresholds = [];
  } as any;
});

// 2. Mock fetch API
global.fetch = jest.fn();

// 3. Mock the Modal components to keep tests focused on Home page logic
jest.mock('../login/page', () => ({ isOpen, onClose }: any) => 
  isOpen ? <div data-testid="login-modal"><button onClick={onClose}>Close</button></div> : null
);
jest.mock('../register/page', () => ({ isOpen, onClose }: any) => 
  isOpen ? <div data-testid="register-modal"><button onClick={onClose}>Close</button></div> : null
);

describe('Home Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders successfully and shows login button when not authenticated', async () => {
    // Mock unauthorized status
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/auth/me') return Promise.resolve({ ok: false });
      if (url === '/api/events') return Promise.resolve({ ok: true, json: async () => [] });
      return Promise.reject(new Error('Unknown API'));
    });

    render(<Home />);

    await waitFor(() => {
      // Matches the "CinemAction" link in your header
      expect(screen.getByRole('link', { name: /CinemAction/i })).toBeInTheDocument();
      // Matches the "S'identifier" span
      expect(screen.getByText(/S'identifier/i)).toBeInTheDocument();
    });
  });

  it('renders dashboard link ("Mon Espace") when user is authenticated', async () => {
    // Mock authorized status
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/auth/me') return Promise.resolve({ 
        ok: true, 
        json: async () => ({ id: 1, name: 'Taha' }) 
      });
      if (url === '/api/events') return Promise.resolve({ ok: true, json: async () => [] });
      return Promise.reject(new Error('Unknown API'));
    });

    render(<Home />);

    await waitFor(() => {
      // Matches the "Mon Espace" text in your code
      expect(screen.getByText(/Mon Espace/i)).toBeInTheDocument();
      // Ensure "S'identifier" is NOT there
      expect(screen.queryByText(/S'identifier/i)).not.toBeInTheDocument();
    });
  });

  it('renders movie cards correctly from API', async () => {
    const mockEvents = [
      {
        id: '1',
        movie_title: 'Bohemian Rhapsody',
        starts_at: '2026-05-20T20:00:00Z',
        location: 'Pathé Bellecour',
        association_name: 'Amnesty International'
      }
    ];

    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/auth/me') return Promise.resolve({ ok: false });
      if (url === '/api/events') return Promise.resolve({ ok: true, json: async () => mockEvents });
      return Promise.reject(new Error('Unknown API'));
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText(/Bohemian Rhapsody/i)).toBeInTheDocument();
      expect(screen.getByText(/Pathé Bellecour/i)).toBeInTheDocument();
      expect(screen.getByText(/Par Amnesty International/i)).toBeInTheDocument();
    });
  });

  it('opens login modal when clicking "S\'identifier"', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false });

    render(<Home />);

    const loginBtn = await screen.findByText(/S'identifier/i);
    fireEvent.click(loginBtn);

    expect(screen.getByTestId('login-modal')).toBeInTheDocument();
  });
});