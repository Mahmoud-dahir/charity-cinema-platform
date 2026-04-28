import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Header } from '../../components/dashboard/Header';

describe('Header Component', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    jest.useFakeTimers(); // On prend le contrôle du temps pour zapper les 400ms
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('affiche le nom de l\'utilisateur et gère la déconnexion', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
    
    const originalLocation = window.location;
    delete (window as any).location;
    window.location = { href: '' } as any;

    render(<Header user={{ first_name: 'John', last_name: 'Doe' }} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();

    const logoutBtn = screen.getByTitle('Se déconnecter');
    fireEvent.click(logoutBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/logout', expect.any(Object));
      expect(window.location.href).toBe('/');
    });

    window.location = originalLocation;
  });

  it('effectue une recherche après un délai et affiche les résultats', async () => {
    render(<Header user={{ first_name: 'John' }} />);
    
    const searchInput = screen.getByPlaceholderText(/Rechercher un film/i);
    
    // On tape "batman"
    fireEvent.change(searchInput, { target: { value: 'batman' } });
    
    // L'API va simuler des résultats
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 1, title: 'Batman Begins', location: 'Lyon' }] }) // events
      .mockResolvedValueOnce({ ok: true, json: async () => [] }); // assos

    // On avance le temps de 400ms (le délai du debounce dans le composant)
    act(() => {
      jest.advanceTimersByTime(400);
    });

    // On attend que les résultats s'affichent
    await waitFor(() => {
      expect(screen.getByText('Batman Begins')).toBeInTheDocument();
      expect(screen.getByText('Événements & Lieux')).toBeInTheDocument();
    });

    // Clic sur le résultat ferme le menu
    fireEvent.click(screen.getByText('Batman Begins'));
    expect(screen.queryByText('Batman Begins')).not.toBeInTheDocument();
  });
});