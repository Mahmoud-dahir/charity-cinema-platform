import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '../dashboard/page';

const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace })
}));

// Contournement du bug SWC en utilisant React.createElement au lieu du JSX
jest.mock('../../components/dashboard/Sidebar', () => ({
  Sidebar: () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'mock-sidebar' }, 'Sidebar');
  }
}));
jest.mock('../../components/dashboard/Header', () => ({
  Header: () => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'mock-header' }, 'Header');
  }
}));

describe('Dashboard Page', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    jest.clearAllMocks();
  });

  it('affiche un état de chargement au début', () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    const { container } = render(<Dashboard />);
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('redirige vers l\'accueil si l\'utilisateur n\'est pas connecté', async () => {
    // On répond systématiquement false peu importe le nombre de rendus
    (global.fetch as jest.Mock).mockImplementation(() => Promise.resolve({ ok: false }));
    
    render(<Dashboard />);
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/');
    });
  });

  it('affiche le dashboard avec les infos de l\'utilisateur si connecté', async () => {
    // On répond systématiquement true
    (global.fetch as jest.Mock).mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: async () => ({ first_name: 'Alice', last_name: 'Dupont' })
      });
    });
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Bonjour, Alice 👋')).toBeInTheDocument();
    });
    
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument();
  });
});