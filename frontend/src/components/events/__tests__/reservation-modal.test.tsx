import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ReservationModal from '../ReservationModal';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('ReservationModal Component', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();
  
  const mockEvent = {
    id: '1',
    title: 'Projection Test',
    movie_title: 'The Matrix',
    starts_at: '2026-05-20T18:00:00Z',
    location: 'Salle 4, Paris',
    capacity: 50,
    signups_count: 10
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <ReservationModal 
        isOpen={false} 
        onClose={mockOnClose} 
        event={mockEvent} 
        onConfirm={mockOnConfirm} 
        isLoading={false} 
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when event is missing', () => {
    const { container } = render(
      <ReservationModal 
        isOpen={true} 
        onClose={mockOnClose} 
        event={null} 
        onConfirm={mockOnConfirm} 
        isLoading={false} 
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('displays event details correctly', () => {
    render(
      <ReservationModal 
        isOpen={true} 
        onClose={mockOnClose} 
        event={mockEvent} 
        onConfirm={mockOnConfirm} 
        isLoading={false} 
      />
    );

    expect(screen.getByText('Confirmation')).toBeInTheDocument();
    expect(screen.getByText('The Matrix')).toBeInTheDocument();
    expect(screen.getByText('Salle 4, Paris')).toBeInTheDocument();
    expect(screen.getByText(/10 \/ 50 places réservées/)).toBeInTheDocument();
    
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });

  it('calls onConfirm when clicking the confirm button', () => {
    render(
      <ReservationModal 
        isOpen={true} 
        onClose={mockOnClose} 
        event={mockEvent} 
        onConfirm={mockOnConfirm} 
        isLoading={false} 
      />
    );

    const confirmBtn = screen.getByText(/Confirmer ma réservation/i);
    fireEvent.click(confirmBtn);
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking the close or cancel button', () => {
    render(
      <ReservationModal 
        isOpen={true} 
        onClose={mockOnClose} 
        event={mockEvent} 
        onConfirm={mockOnConfirm} 
        isLoading={false} 
      />
    );

    const cancelBtn = screen.getByText(/Annuler/i);
    fireEvent.click(cancelBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    const closeIconBtn = screen.getAllByRole('button')[0];
    fireEvent.click(closeIconBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(2);
  });

  it('shows loading state and disables buttons', () => {
    render(
      <ReservationModal 
        isOpen={true} 
        onClose={mockOnClose} 
        event={mockEvent} 
        onConfirm={mockOnConfirm} 
        isLoading={true} 
      />
    );

    expect(screen.queryByText(/Confirmer ma réservation/i)).not.toBeInTheDocument();
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(btn => {
      expect(btn).toBeDisabled();
    });
  });
});
