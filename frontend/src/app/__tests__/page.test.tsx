import { render, screen, waitFor } from '@testing-library/react';
import Home from '../page';
import '@testing-library/jest-dom';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
}));

describe('Home Component', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders successfully and shows login button when not authenticated', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({})
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /Nom.*Application/i })).toBeInTheDocument();
      expect(screen.getByText(/Slogan/i)).toBeInTheDocument();
      expect(screen.getByText(/Connexion\/Inscription/i)).toBeInTheDocument();
    });
  });

  it('renders dashboard link when user is authenticated', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ name: 'Taha', role: 'student' })
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText(/Tableau de bord/i)).toBeInTheDocument();
      expect(screen.queryByText(/Connexion\/Inscription/i)).not.toBeInTheDocument();
    });
  });

  it('renders movie cards correctly', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, json: async () => ({}) });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText(/Bohemian Rapsody/i)).toBeInTheDocument();
      expect(screen.getByText(/Prochaines Séances Solidaires/i)).toBeInTheDocument();
    });
  });
});