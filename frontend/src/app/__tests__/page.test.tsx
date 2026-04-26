import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Home from '../page';

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

global.fetch = jest.fn();

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
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/auth/me') return Promise.resolve({ ok: false, status: 401 });
      if (url === '/api/events') return Promise.resolve({ 
        ok: true, 
        status: 200, 
        json: async () => [] 
      });
      return Promise.reject(new Error('Unknown API'));
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /Cinem.*Action/i })).toBeInTheDocument();
      expect(screen.getByText(/S'identifier/i)).toBeInTheDocument();
    });
  });

  it('renders "Mon Espace" when user is authenticated', async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/auth/me') return Promise.resolve({ 
        ok: true, 
        status: 200,
        json: async () => ({ id: 1, name: 'Taha' }) 
      });
      if (url === '/api/events') return Promise.resolve({ ok: true, status: 200, json: async () => [] });
      return Promise.reject(new Error('Unknown API'));
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText(/Mon Espace/i)).toBeInTheDocument();
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
      if (url === '/api/auth/me') return Promise.resolve({ ok: false, status: 401 });
      if (url === '/api/events') return Promise.resolve({ 
        ok: true, 
        status: 200, 
        json: async () => mockEvents 
      });
      return Promise.reject(new Error('Unknown API'));
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText(/Bohemian Rhapsody/i)).toBeInTheDocument();
      expect(screen.getByText(/Pathé Bellecour/i)).toBeInTheDocument();
    });
  });

  it('opens login modal when clicking "S\'identifier"', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 401 });

    render(<Home />);

    const loginBtn = await screen.findByText(/S'identifier/i);
    fireEvent.click(loginBtn);

    expect(screen.getByTestId('login-modal')).toBeInTheDocument();
  });
});