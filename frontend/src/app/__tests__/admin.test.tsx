// src/app/__tests__/admin.test.tsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AdminLayout from '../admin/layout';
import AdminDashboardPage from '../admin/page';
import AdminUsersPage from '../admin/users/page';

jest.mock('next/navigation', () => ({ useRouter: () => ({ replace: jest.fn() }) }));

// Mocks simples pour les composants complexes
jest.mock('../../components/admin/RequestCard', () => ({ 
  RequestCard: ({ onApprove, onReject }: any) => (
    <div data-testid="request-card">
      <button onClick={() => onApprove('1', 'ok')}>Approuver</button>
      <button onClick={() => onReject('1', 'non')}>Refuser</button>
    </div>
  )
}));

describe('Admin Pages', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    window.alert = jest.fn();
  });

  it('AdminLayout renders correctly', () => {
    render(<AdminLayout><div>Contenu Admin</div></AdminLayout>);
    expect(screen.getByText('Contenu Admin')).toBeInTheDocument();
  });

  it('AdminDashboardPage fetches and manages pending requests', async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/auth/me') return Promise.resolve({ ok: true, json: async () => ({ is_staff: true }) });
      if (url === '/api/association-requests') return Promise.resolve({ ok: true, json: async () => [{ id: '1', status: 'pending' }] });
      if (url.includes('/approve') || url.includes('/reject')) return Promise.resolve({ ok: true });
      return Promise.reject();
    });

    render(<AdminDashboardPage />);
    await waitFor(() => expect(screen.getByTestId('request-card')).toBeInTheDocument());

    // Test de l'approbation
    fireEvent.click(screen.getByText('Approuver'));
    await waitFor(() => expect(screen.queryByTestId('request-card')).not.toBeInTheDocument());
  });

  it('AdminUsersPage fetches and displays users', async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/auth/me') return Promise.resolve({ ok: true, json: async () => ({ is_staff: true }) });
      if (url === '/api/admin/users') return Promise.resolve({ 
        ok: true, 
        json: async () => [{ id: '1', first_name: 'Admin', email: 'admin@asso.com', is_staff: true, has_association: true, association_name: 'SuperAsso', date_joined: '2026-01-01T00:00:00Z' }] 
      });
      return Promise.reject();
    });

    render(<AdminUsersPage />);
    await waitFor(() => {
      expect(screen.getByText('admin@asso.com')).toBeInTheDocument();
      expect(screen.getByText('SuperAsso')).toBeInTheDocument();
    });
  });
});