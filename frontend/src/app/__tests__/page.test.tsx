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

describe('Home Component Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });


  const mockApi = (authData: any = null, eventsData: any[] = []) => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/auth/me') {
        return authData 
          ? Promise.resolve({ ok: true, status: 200, json: async () => authData })
          : Promise.resolve({ ok: false, status: 401 });
      }
      if (url === '/api/events') {
        return Promise.resolve({ ok: true, status: 200, json: async () => eventsData });
      }
      return Promise.reject(new Error(`Unhandled API call: ${url}`));
    });
  };

  it('renders successfully and shows login button when not authenticated', async () => {
    mockApi(null, []);

    render(<Home />);

    await waitFor(() => {
      const brandLinks = screen.getAllByRole('link', { name: /Cinem.*Action/i });
      expect(brandLinks[0]).toBeInTheDocument();
      expect(screen.getByText(/S'identifier/i)).toBeInTheDocument();
    });
  });

  it('renders "Mon Espace" instead of login when user is authenticated', async () => {
    mockApi({ id: 1, name: 'Taha' }, []);

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText(/Mon Espace/i)).toBeInTheDocument();
      expect(screen.queryByText(/S'identifier/i)).not.toBeInTheDocument();
    });
  });

  it('renders movie cards correctly when data is returned from the API', async () => {
    const mockEvents = [
      {
        id: 'event-123',
        movie_title: 'Bohemian Rhapsody',
        starts_at: '2026-05-20T20:00:00Z',
        location: 'Pathé Bellecour',
        association_name: 'Amnesty International',
        cover_image: 'https://example.com/image.jpg'
      }
    ];
    
    mockApi(null, mockEvents);

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText(/Bohemian Rhapsody/i)).toBeInTheDocument();
      expect(screen.getByText(/Pathé Bellecour/i)).toBeInTheDocument();
      expect(screen.getByText(/Par Amnesty International/i)).toBeInTheDocument();
    });
  });

  it('opens the login modal when the "S\'identifier" button is clicked', async () => {
    mockApi(null, []);

    render(<Home />);

    const loginTrigger = await screen.findByText(/S'identifier/i);
    fireEvent.click(loginTrigger);

    expect(screen.getByTestId('login-modal')).toBeInTheDocument();
  });

  it('displays a fallback message when no events are available', async () => {
    mockApi(null, []);

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText(/Aucun événement prévu pour le moment/i)).toBeInTheDocument();
    });
  });
});