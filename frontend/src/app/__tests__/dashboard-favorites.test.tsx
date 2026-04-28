// src/app/__tests__/dashboard-favorites.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import FavoritesPage from '../dashboard/favorites/page';

jest.mock('next/navigation', () => ({ useRouter: () => ({ replace: jest.fn() }) }));
jest.mock('../../components/dashboard/Sidebar', () => ({ Sidebar: () => <div>Sidebar</div> }));
jest.mock('../../components/dashboard/Header', () => ({ Header: () => <div>Header</div> }));

describe('Favorites Dashboard Page', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  it('shows empty state when there are no favorites', async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/auth/me') return Promise.resolve({ ok: true, json: async () => ({}) });
      if (url === '/api/events?favorited=true') return Promise.resolve({ ok: true, json: async () => [] });
      return Promise.reject(new Error('not found'));
    });

    render(<FavoritesPage />);
    await waitFor(() => {
      expect(screen.getByText("Aucun favori pour l'instant")).toBeInTheDocument();
    });
  });

  it('renders favorited events', async () => {
    const mockEvents = [{ id: '1', title: 'Film de test', starts_at: '2026-06-01T20:00:00Z', location: 'Paris' }];
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/auth/me') return Promise.resolve({ ok: true, json: async () => ({}) });
      if (url === '/api/events?favorited=true') return Promise.resolve({ ok: true, json: async () => mockEvents });
      return Promise.reject(new Error('not found'));
    });

    render(<FavoritesPage />);
    await waitFor(() => {
      // Utilisation de getAllByText car le titre est présent 2 fois (overlay + carte)
      expect(screen.getAllByText('Film de test').length).toBeGreaterThan(0);
      expect(screen.getByText('Paris')).toBeInTheDocument();
    });
  });
});