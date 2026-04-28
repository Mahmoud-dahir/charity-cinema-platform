import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EventDetailModal } from '../../components/events/EventDetailModal';

describe('EventDetailModal Component', () => {
  const mockOnClose = jest.fn();
  
  const mockEvent = {
    id: '123',
    title: 'Projection Solidaire',
    movie_title: 'Inception', // C'est ça qui est affiché !
    description: 'Une super soirée',
    starts_at: '2026-10-15T20:00:00Z',
    location: 'Cinéma Le Zola',
    capacity: 100,
    price: 5.50,
    cover_image: 'https://image.com/cover.jpg',
    association_name: 'CinéAsso',
    status: 'published'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url.includes('/comments/')) {
        return Promise.resolve({ ok: true, json: async () => [] });
      }
      if (url.includes('/signup/')) {
        return Promise.resolve({ ok: true });
      }
      return Promise.resolve({ ok: true });
    });
  });

  it('devient invisible via CSS si isOpen est false', () => {
    const { container } = render(<EventDetailModal isOpen={false} onClose={mockOnClose} event={mockEvent} />);
    // On ne s'attend à aucun fetch ici car la modale est fermée
    expect(container.firstChild).toHaveClass('opacity-0');
  });

  it('affiche les détails de l\'événement correctement', async () => {
    render(<EventDetailModal isOpen={true} onClose={mockOnClose} event={mockEvent} />);
    
    // On cherche uniquement ce qui est vraiment affiché dans le DOM
    expect(screen.getByText('Inception')).toBeInTheDocument();
    expect(screen.getByText('Une super soirée')).toBeInTheDocument();
    expect(screen.getByText('Cinéma Le Zola')).toBeInTheDocument();
    expect(screen.getByText('CinéAsso')).toBeInTheDocument();
    
    // On attend que les commentaires chargent
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
  });

  it('ferme la modale quand on clique sur le bouton fermer (la croix)', async () => {
    render(<EventDetailModal isOpen={true} onClose={mockOnClose} event={mockEvent} />);
    
    const closeButtons = screen.getAllByRole('button');
    fireEvent.click(closeButtons[0]); 
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
  });

  it('gère l\'inscription à la séance via l\'API', async () => {
    render(<EventDetailModal isOpen={true} onClose={mockOnClose} event={mockEvent} />);
    
    // 1. On attend que le GET initial (commentaires) se termine
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    
    // 2. On clique sur s'inscrire
    const reserveBtn = screen.getByRole('button', { name: /S'inscrire à la séance/i });
    fireEvent.click(reserveBtn);
    
    // 3. On vérifie que la bonne requête POST est partie
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(`/api/events/123/signup/`, expect.objectContaining({ method: 'POST' }));
    });
  });
});