import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ParametresPage from '../dashboard/parametres/page';

const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ replace: mockReplace, push: jest.fn() })),
}));

jest.mock('@/components/dashboard/Header', () => ({
  Header: () => <div data-testid="mock-header">Header</div>,
}));

jest.mock('@/components/dashboard/Sidebar', () => ({
  Sidebar: () => <div data-testid="mock-sidebar">Sidebar</div>,
}));

describe('ParametresPage', () => {
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  const setupFetchMock = (success = true) => {
    (global.fetch as jest.Mock).mockImplementation((url, options) => {
      if (url === '/api/auth/me') {
        if (options?.method === 'PATCH') {
          return Promise.resolve({ ok: true, json: async () => ({}) });
        }
        if (success) {
          return Promise.resolve({ ok: true, json: async () => mockUser });
        }
        return Promise.resolve({ ok: false });
      }
      
      if (url === '/api/auth/change-password') {
        return Promise.resolve({ ok: true, json: async () => ({ message: 'Success' }) });
      }
      
      return Promise.reject(new Error('Unhandled fetch'));
    });
  };

  const getFormInput = (labelRegex: RegExp) => {
    const label = screen.getByText(labelRegex);
    return label.parentElement?.querySelector('input') as HTMLInputElement;
  };

  it('renders loading state initially', () => {
    (global.fetch as jest.Mock).mockReturnValue(new Promise(() => {}));
    const { container } = render(<ParametresPage />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('redirects to / if not authenticated', async () => {
    setupFetchMock(false);
    render(<ParametresPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/');
    });
  });

  it('renders profile and security forms after loading', async () => {
    setupFetchMock(true);
    render(<ParametresPage />);

    await waitFor(() => {
      expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    });

    expect(getFormInput(/^Prénom$/i).value).toBe('John');
    expect(getFormInput(/^Nom$/i).value).toBe('Doe');
    expect(screen.getByText(/^Sécurité$/i)).toBeInTheDocument();
  });

  it('handles successful profile update', async () => {
    setupFetchMock(true);
    render(<ParametresPage />);
    await waitFor(() => screen.getByTestId('mock-header'));

    const firstNameInput = getFormInput(/^Prénom$/i);
    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });

    const saveBtn = screen.getByRole('button', { name: /Enregistrer/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/me', expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ first_name: 'Jane', last_name: 'Doe' })
      }));
      expect(screen.getByText(/Profil mis à jour avec succès/i)).toBeInTheDocument();
    });
  });

  it('prevents password submission if passwords do not match', async () => {
    setupFetchMock(true);
    render(<ParametresPage />);
    await waitFor(() => screen.getByTestId('mock-header'));

    const oldPass = getFormInput(/^Mot de passe actuel$/i);
    const newPass = getFormInput(/^Nouveau mot de passe$/i);
    const confirmPass = getFormInput(/^Confirmer le nouveau mot de passe$/i);

    fireEvent.change(oldPass, { target: { value: 'oldpass123' } });
    fireEvent.change(newPass, { target: { value: 'newpass123' } });
    fireEvent.change(confirmPass, { target: { value: 'different' } });

    const changeBtn = screen.getByRole('button', { name: /Modifier le mot de passe/i });
    fireEvent.click(changeBtn);

    await waitFor(() => {
      expect(screen.getByText(/Les nouveaux mots de passe ne correspondent pas/i)).toBeInTheDocument();
    });
  });

  it('handles successful password change', async () => {
    setupFetchMock(true);
    render(<ParametresPage />);
    await waitFor(() => screen.getByTestId('mock-header'));

    const oldPass = getFormInput(/^Mot de passe actuel$/i);
    const newPass = getFormInput(/^Nouveau mot de passe$/i);
    const confirmPass = getFormInput(/^Confirmer le nouveau mot de passe$/i);

    fireEvent.change(oldPass, { target: { value: 'old123' } });
    fireEvent.change(newPass, { target: { value: 'new123456' } });
    fireEvent.change(confirmPass, { target: { value: 'new123456' } });

    const changeBtn = screen.getByRole('button', { name: /Modifier le mot de passe/i });
    fireEvent.click(changeBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/change-password', expect.objectContaining({
        method: 'POST'
      }));
      expect(screen.getByText(/Mot de passe modifié avec succès/i)).toBeInTheDocument();
    });
  });
});
