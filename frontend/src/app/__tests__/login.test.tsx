import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginModal from '../login/page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() })
}));

describe('LoginModal Component', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('ne s\'affiche pas si isOpen est false', () => {
    const { container } = render(<LoginModal isOpen={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('permet de saisir un email et un mot de passe', () => {
    render(<LoginModal isOpen={true} />);
    
    const emailInput = screen.getByLabelText(/Email\*/i);
    const passwordInput = screen.getByLabelText(/Mot de passe\*/i);

    fireEvent.change(emailInput, { target: { value: 'test@exemple.com' } });
    fireEvent.change(passwordInput, { target: { value: 'monmotdepasse' } });

    expect(emailInput).toHaveValue('test@exemple.com');
    expect(passwordInput).toHaveValue('monmotdepasse');
  });

  it('affiche un état de chargement et redirige en cas de succès (Status 200)', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
    
    const originalLocation = window.location;
    delete (window as any).location;
    window.location = { href: '' } as any;

    render(<LoginModal isOpen={true} />);
    
    fireEvent.change(screen.getByLabelText(/Email\*/i), { target: { value: 'test@exemple.com' } });
    fireEvent.change(screen.getByLabelText(/Mot de passe\*/i), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Se connecter/i }));

    expect(screen.getByRole('button', { name: /Connexion\.\.\./i })).toBeInTheDocument();

    await waitFor(() => {
      expect(window.location.href).toBe('/dashboard');
    });

    window.location = originalLocation;
  });

  it('affiche un message d\'erreur si les identifiants sont invalides', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Identifiants invalides' })
    });

    render(<LoginModal isOpen={true} />);
    
    fireEvent.change(screen.getByLabelText(/Email\*/i), { target: { value: 'wrong@exemple.com' } });
    fireEvent.change(screen.getByLabelText(/Mot de passe\*/i), { target: { value: 'wrongpass' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Se connecter/i }));

    await waitFor(() => {
      expect(screen.getByText('Identifiants invalides')).toBeInTheDocument();
    });
  });
});