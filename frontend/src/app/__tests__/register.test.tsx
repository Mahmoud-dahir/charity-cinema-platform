import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterModal from '../register/page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() })
}));

describe('RegisterModal Component', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('bloque la soumission si les conditions générales ne sont pas acceptées', async () => {
    render(<RegisterModal isOpen={true} />);
    
    fireEvent.change(screen.getByLabelText(/^Nom\*/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/^Prénom\*/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/^Email\*/i), { target: { value: 'new@exemple.com' } });
    
    // On cible les deux champs mot de passe via leurs points de masquage
    const passwordInputs = screen.getAllByPlaceholderText('••••••••••••');
    fireEvent.change(passwordInputs[0], { target: { value: 'pass123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'pass123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /S'inscrire/i }));

    expect(await screen.findByText("Veuillez accepter les conditions générales d'utilisation.")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('gère l\'inscription avec succès si tout est bien rempli', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
    
    const originalLocation = window.location;
    delete (window as any).location;
    window.location = { href: '' } as any;

    render(<RegisterModal isOpen={true} />);
    
    fireEvent.change(screen.getByLabelText(/^Nom\*/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/^Prénom\*/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/^Email\*/i), { target: { value: 'john@exemple.com' } });
    
    const passwordInputs = screen.getAllByPlaceholderText('••••••••••••');
    fireEvent.change(passwordInputs[0], { target: { value: 'pass123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'pass123' } });
    
    fireEvent.click(screen.getByLabelText(/J'ai lu et accepté les/i));
    fireEvent.click(screen.getByRole('button', { name: /S'inscrire/i }));

    expect(screen.getByRole('button', { name: /Inscription\.\.\./i })).toBeInTheDocument();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(window.location.href).toBe('/dashboard');
    });

    window.location = originalLocation;
  });

  it('affiche les erreurs renvoyées par le backend (ex: email déjà utilisé)', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ email: ["Cet email existe déjà."] })
    });

    render(<RegisterModal isOpen={true} />);
    
    fireEvent.change(screen.getByLabelText(/^Nom\*/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/^Prénom\*/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/^Email\*/i), { target: { value: 'exist@exemple.com' } });
    
    const passwordInputs = screen.getAllByPlaceholderText('••••••••••••');
    fireEvent.change(passwordInputs[0], { target: { value: 'pass123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'pass123' } });
    
    fireEvent.click(screen.getByLabelText(/J'ai lu et accepté les/i));
    fireEvent.click(screen.getByRole('button', { name: /S'inscrire/i }));

    await waitFor(() => {
      expect(screen.getByText('email: Cet email existe déjà.')).toBeInTheDocument();
    });
  });
});