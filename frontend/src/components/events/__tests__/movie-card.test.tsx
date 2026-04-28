import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MovieCard } from '../MovieCard';

describe('MovieCard Component', () => {
  const mockOnFavoriteClick = jest.fn();
  const mockOnDetailsClick = jest.fn();
  const mockOnSignupClick = jest.fn();

  const mockEvent = {
    id: '1',
    title: 'Soirée Spéciale',
    movie_title: 'Interstellar',
    starts_at: '2026-12-25T19:00:00Z',
    location: 'Cinéma Rex, Lyon',
    capacity: 200,
    signups_count: 150,
    association_name: 'Cinéma Solidaire',
    cover_image: 'https://example.com/movie.jpg'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders event details correctly', () => {
    render(<MovieCard event={mockEvent} />);

    expect(screen.getByText('Soirée Spéciale')).toBeInTheDocument();
    expect(screen.getByText(/Interstellar/)).toBeInTheDocument();
    expect(screen.getByText('Par Cinéma Solidaire')).toBeInTheDocument();
    expect(screen.getByText('Cinéma Rex, Lyon')).toBeInTheDocument();
    expect(screen.getByText('150 / 200 places')).toBeInTheDocument();
    
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });

  it('renders fallback image if none provided', () => {
    const eventWithoutImage = { ...mockEvent, cover_image: null };
    const { container } = render(<MovieCard event={eventWithoutImage} />);
    const imageDiv = container.querySelector('[style*="background-image"]');
    expect(imageDiv).toHaveAttribute('style', expect.stringContaining('unsplash.com'));
  });

  it('shows empty state when hasDetails is false', () => {
    render(<MovieCard event={mockEvent} hasDetails={false} />);
    expect(screen.getByText('Programmations à venir...')).toBeInTheDocument();
    expect(screen.queryByText('Soirée Spéciale')).not.toBeInTheDocument();
  });

  it('displays counts correctly', () => {
    render(<MovieCard event={mockEvent} favoritesCount={10} commentsCount={5} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('handles favorite status correctly', () => {
    const { rerender } = render(<MovieCard event={mockEvent} isFavorited={false} />);
    const favoriteBtn = screen.getAllByRole('button')[0];
    expect(favoriteBtn).toHaveClass('bg-slate-800');

    rerender(<MovieCard event={mockEvent} isFavorited={true} />);
    expect(favoriteBtn).toHaveClass('bg-red-500/20');
  });

  it('handles signup status correctly', () => {
    const { rerender } = render(<MovieCard event={mockEvent} isSignedUp={false} />);
    expect(screen.getByText("S'inscrire")).toBeInTheDocument();

    rerender(<MovieCard event={mockEvent} isSignedUp={true} />);
    expect(screen.getByText('Inscrit')).toBeInTheDocument();
  });

  it('calls callbacks when buttons are clicked', () => {
    render(
      <MovieCard 
        event={mockEvent} 
        onFavoriteClick={mockOnFavoriteClick}
        onDetailsClick={mockOnDetailsClick}
        onSignupClick={mockOnSignupClick}
      />
    );

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(mockOnFavoriteClick).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('Détails'));
    expect(mockOnDetailsClick).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText("S'inscrire"));
    expect(mockOnSignupClick).toHaveBeenCalledTimes(1);
  });
});
