// src/app/__tests__/dashboard-reservations.test.tsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ReservationsPage from '../dashboard/reservations/page';

jest.mock('next/navigation', () => ({ useRouter: () => ({ replace: jest.fn() }) }));
jest.mock('../../components/dashboard/Sidebar', () => ({ Sidebar: () => <div>Sidebar</div> }));
jest.mock('../../components/dashboard/Header', () => ({ Header: () => <div>Header</div> }));

describe('Reservations Dashboard Page', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    window.confirm = jest.fn().mockReturnValue(true);
    window.alert = jest.fn();
  });

  it('renders empty state when no reservations exist', async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/auth/me') return Promise.resolve({ ok: true, json: async () => ({}) });
      if (url === '/api/events?signedup=true') return Promise.resolve({ ok: true, json: async () => [] });
      return Promise.reject();
    });

    render(<ReservationsPage />);
    await waitFor(() => {
      expect(screen.getByText('Aucune inscription active')).toBeInTheDocument();
    });
  });

  it('allows cancelling a reservation', async () => {
    const mockEvents = [{ id: '10', title: 'Soirée spéciale', starts_at: '2026-05-10T19:00:00Z', location: 'Lyon' }];
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/auth/me') return Promise.resolve({ ok: true, json: async () => ({}) });
      if (url === '/api/events?signedup=true') return Promise.resolve({ ok: true, json: async () => mockEvents });
      if (url === '/api/events/10/signup/') return Promise.resolve({ ok: true, status: 204 });
      return Promise.reject();
    });

    render(<ReservationsPage />);
    await waitFor(() => expect(screen.getByText('Soirée spéciale')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /Annuler/i }));
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/events/10/signup/', expect.objectContaining({ method: 'DELETE' }));
      expect(screen.getByText('Aucune inscription active')).toBeInTheDocument();
    });
  });
});