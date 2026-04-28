import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NewEventPage from '../dashboard/events/new/page';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/components/dashboard/Header', () => ({
  Header: () => <div data-testid="mock-header">Header</div>,
}));
jest.mock('@/components/dashboard/Sidebar', () => ({
  Sidebar: () => <div data-testid="mock-sidebar">Sidebar</div>,
}));

global.fetch = jest.fn();
window.alert = jest.fn();
global.URL.createObjectURL = jest.fn(() => 'mock-url');

describe('NewEventPage', () => {
  const mockPush = jest.fn();
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
    });

    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/auth/me') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ id: 1, name: 'Taha', role: 'admin' }),
        });
      }
      if (url === '/api/events/categories/') {
        return Promise.resolve({
          ok: true,
          json: async () => [
            { id: 1, name: 'Action', slug: 'action' },
            { id: 2, name: 'Sci-Fi', slug: 'sci-fi' },
          ],
        });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    });
  });

  it('redirects to home if user is not authenticated', async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/auth/me') return Promise.resolve({ ok: false });
      return Promise.resolve({ ok: true, json: async () => [] });
    });

    render(<NewEventPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/');
    });
  });

  it('renders the form and handles category selection', async () => {
    render(<NewEventPage />);

    const categoryBtn = await screen.findByText(/Sci-Fi/i);
    expect(categoryBtn).toBeInTheDocument();

    fireEvent.click(categoryBtn);
    expect(categoryBtn).toHaveClass('bg-yellow-100');
  });

  it('submits the form successfully and redirects', async () => {
    (global.fetch as jest.Mock).mockImplementation((url, options) => {
      if (options?.method === 'POST') {
        return Promise.resolve({ ok: true });
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    });

    render(<NewEventPage />);

    fireEvent.change(screen.getByLabelText(/Titre de l'événement/i), {
      target: { value: 'Soirée Master' },
    });
    fireEvent.change(screen.getByLabelText(/Titre du film/i), {
      target: { value: 'Inception' },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: 'Une description de test' },
    });
    fireEvent.change(screen.getByLabelText(/Date et heure de début/i), {
      target: { value: '2026-05-20T20:00' },
    });
    fireEvent.change(screen.getByLabelText(/Lieu/i), {
      target: { value: 'Lyon 1' },
    });

    const submitBtn = screen.getByRole('button', { name: /Créer le brouillon/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard/events');
    });
  });

  it('shows an alert on network error', async () => {
    (global.fetch as jest.Mock).mockImplementation((url, options) => {
      if (options?.method === 'POST') {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.resolve({ ok: true, json: async () => ({}) });
    });

    render(<NewEventPage />);

    const submitBtn = screen.getByRole('button', { name: /Créer le brouillon/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Erreur réseau.');
    });
  });
});