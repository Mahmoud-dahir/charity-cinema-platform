// src/app/__tests__/dashboard-events-new.test.tsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import NewEventPage from '../dashboard/events/new/page';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/dashboard/events/new'),
  useRouter: () => ({ push: mockPush, replace: jest.fn() })
}));
jest.mock('../../components/dashboard/Header', () => ({ Header: () => <div>Header</div> }));

describe('New Event Page', () => {
  beforeEach(() => { 
    global.fetch = jest.fn();
    window.alert = jest.fn();
    jest.clearAllMocks();
  });

  it('submits the form successfully', async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/auth/me') return Promise.resolve({ ok: true, json: async () => ({}) });
      if (url === '/api/events') return Promise.resolve({ ok: true });
      return Promise.reject();
    });

    render(<NewEventPage />);
    
    await waitFor(() => expect(screen.getByLabelText(/Titre de l'événement/i)).toBeInTheDocument());
    
    fireEvent.change(screen.getByLabelText(/Titre de l'événement/i), { target: { value: 'Test Event' } });
    fireEvent.change(screen.getByLabelText(/Titre du film/i), { target: { value: 'Movie' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Desc' } });
    fireEvent.change(screen.getByLabelText(/Date et heure de début/i), { target: { value: '2026-10-10T10:00' } });
    fireEvent.change(screen.getByLabelText(/Lieu/i), { target: { value: 'Paris' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Créer le brouillon/i }));
    
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/dashboard/events'));
  });
});