import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EventCard } from '../../components/events/EventCard';

describe('EventCard Component', () => {
  // AJOUT ICI : On force la promesse à se résoudre pour libérer le isProcessing
  const mockPublish = jest.fn().mockResolvedValue(undefined);
  const mockCancel = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
  });

  it('affiche un événement en brouillon avec ses boutons', () => {
    const event = { id: '1', title: 'Soirée Matrix', movie_title: 'Matrix', status: 'draft', starts_at: '2026-05-20T20:00:00Z' };
    render(<EventCard event={event} onPublish={mockPublish} onCancel={mockCancel} />);
    
    expect(screen.getByText('Soirée Matrix')).toBeInTheDocument();
    expect(screen.getByText('Brouillon')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Publier/i })).toBeInTheDocument();
  });

  it('appelle onPublish quand on clique sur Publier', async () => {
    const event = { id: '1', title: 'Test', status: 'draft', starts_at: '2026-05-20T20:00:00Z' };
    render(<EventCard event={event} onPublish={mockPublish} onCancel={mockCancel} />);
    
    fireEvent.click(screen.getByRole('button', { name: /Publier/i }));
    
    // AJOUT ICI : On attend que l'action se termine proprement
    await waitFor(() => {
      expect(mockPublish).toHaveBeenCalledWith('1');
    });
  });

  it('gère le flux d\'annulation avec la raison obligatoire', async () => {
    const event = { id: '2', title: 'Test Annulation', status: 'published', starts_at: '2026-05-20T20:00:00Z' };
    render(<EventCard event={event} onPublish={mockPublish} onCancel={mockCancel} />);
    
    fireEvent.click(screen.getByRole('button', { name: /Annuler/i }));
    
    const validerBtn = screen.getByRole('button', { name: /Confirmer/i });
    fireEvent.click(validerBtn);
    expect(window.alert).toHaveBeenCalledWith("Veuillez fournir une raison d'annulation.");
    expect(mockCancel).not.toHaveBeenCalled();

    const input = screen.getByPlaceholderText("Raison de l'annulation...");
    fireEvent.change(input, { target: { value: 'Problème technique' } });
    fireEvent.click(validerBtn);

    // AJOUT ICI : On attend que l'annulation soit bien transmise
    await waitFor(() => {
      expect(mockCancel).toHaveBeenCalledWith('2', 'Problème technique');
    });
  });
});