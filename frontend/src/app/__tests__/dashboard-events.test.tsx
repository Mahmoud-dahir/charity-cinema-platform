import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import EventsDashboardPage from '../dashboard/events/page';

const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace })
}));

jest.mock('../../components/dashboard/Sidebar', () => ({
  Sidebar: () => {
    const React = require('react');
    return React.createElement('div', null, 'Sidebar');
  }
}));
jest.mock('../../components/dashboard/Header', () => ({
  Header: () => {
    const React = require('react');
    return React.createElement('div', null, 'Header');
  }
}));

jest.mock('../../components/events/EventCard', () => ({
  EventCard: (props: any) => {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'event-card-' + props.event.id },
      React.createElement('span', null, props.event.movie_title + ' - ' + props.event.status),
      React.createElement('button', { onClick: () => props.onPublish(props.event.id) }, 'Publier'),
      React.createElement('button', { onClick: () => props.onCancel(props.event.id, 'Annulé par test') }, 'Annuler')
    );
  }
}));

window.alert = jest.fn();

describe('Events Dashboard Page', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    jest.clearAllMocks();
  });

  // On simule une logique réseau parfaite : la réponse dépend de l'URL appelée !
  const mockNetwork = (overrides = {}) => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/auth/me') return Promise.resolve({ ok: true, json: async () => ({ has_association: true, ...overrides }) });
      if (url === '/api/dashboard/events') return Promise.resolve({ ok: true, json: async () => (overrides as any).events || [] });
      if (url.includes('/publish') || url.includes('/cancel')) return Promise.resolve({ ok: (overrides as any).actionSuccess ?? true });
      return Promise.reject(new Error('URL non trouvée'));
    });
  };

  it('redirige vers la création d\'asso si l\'utilisateur n\'en a pas', async () => {
    mockNetwork({ has_association: false });
    
    render(<EventsDashboardPage />);
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/dashboard/association');
    });
  });

  it('affiche l\'état vide si l\'utilisateur a une asso mais pas d\'événements', async () => {
    mockNetwork({ events: [] });

    render(<EventsDashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Aucun événement')).toBeInTheDocument();
    });
  });

  it('affiche la liste des événements, permet de publier et d\'annuler', async () => {
    mockNetwork({ events: [{ id: '1', movie_title: 'Inception', status: 'draft' }] });

    render(<EventsDashboardPage />);
    await waitFor(() => {
      expect(screen.getByText('Inception - draft')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Publier'));
    await waitFor(() => {
      expect(screen.getByText('Inception - published')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Annuler'));
    await waitFor(() => {
      expect(screen.getByText('Inception - cancelled')).toBeInTheDocument();
    });
  });

  it('affiche une alerte si la publication échoue', async () => {
    mockNetwork({ events: [{ id: '2', movie_title: 'Titanic', status: 'draft' }], actionSuccess: false });

    render(<EventsDashboardPage />);
    await waitFor(() => expect(screen.getByText('Titanic - draft')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Publier'));
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Erreur lors de la publication.');
    });
  });
});