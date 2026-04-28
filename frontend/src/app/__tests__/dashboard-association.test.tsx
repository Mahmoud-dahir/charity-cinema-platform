// src/app/__tests__/dashboard-association.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AssociationPage from '../dashboard/association/page';

jest.mock('next/navigation', () => ({ useRouter: () => ({ replace: jest.fn() }) }));
jest.mock('../../components/dashboard/Sidebar', () => ({ Sidebar: () => <div>Sidebar</div> }));
jest.mock('../../components/dashboard/Header', () => ({ Header: () => <div>Header</div> }));
jest.mock('../../components/association/AssociationRequestForm', () => ({ AssociationRequestForm: () => <div data-testid="asso-form" /> }));

describe('Dashboard Association Page', () => {
  beforeEach(() => { global.fetch = jest.fn(); });

  it('shows association details if user has one', async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/auth/me') return Promise.resolve({ ok: true, json: async () => ({ has_association: true, association_name: 'AssoTest' }) });
      if (url === '/api/association-requests') return Promise.resolve({ ok: true, json: async () => [] });
      return Promise.reject();
    });

    render(<AssociationPage />);
    await waitFor(() => expect(screen.getByText('AssoTest')).toBeInTheDocument());
  });

  it('shows pending request message if request is pending', async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/auth/me') return Promise.resolve({ ok: true, json: async () => ({ has_association: false }) });
      if (url === '/api/association-requests') return Promise.resolve({ ok: true, json: async () => [{ id: '1', status: 'pending' }] });
      return Promise.reject();
    });

    render(<AssociationPage />);
    await waitFor(() => expect(screen.getByText("Demande en cours d'examen")).toBeInTheDocument());
  });
  
  it('shows form if no association and no requests', async () => {
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === '/api/auth/me') return Promise.resolve({ ok: true, json: async () => ({ has_association: false }) });
      if (url === '/api/association-requests') return Promise.resolve({ ok: true, json: async () => [] });
      return Promise.reject();
    });

    render(<AssociationPage />);
    await waitFor(() => expect(screen.getByTestId('asso-form')).toBeInTheDocument());
  });
});