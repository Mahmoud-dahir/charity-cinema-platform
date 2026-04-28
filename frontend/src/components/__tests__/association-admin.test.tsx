// src/components/__tests__/association-admin.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RequestCard } from '../admin/RequestCard';
import { AssociationRequestForm } from '../association/AssociationRequestForm';

describe('Admin & Association Components', () => {
  describe('RequestCard', () => {
    const mockApprove = jest.fn().mockResolvedValue(undefined);
    const mockReject = jest.fn().mockResolvedValue(undefined);

    beforeEach(() => {
      jest.clearAllMocks();
      window.alert = jest.fn();
    });

    it('renders request details correctly', () => {
      const request = { id: '1', name: 'AssoTest', description: 'Desc', website_url: 'https://test.com', requested_by: { first_name: 'John', last_name: 'Doe', email: 'j@d.com' } };
      render(<RequestCard request={request} onApprove={mockApprove} onReject={mockReject} />);
      expect(screen.getByText('AssoTest')).toBeInTheDocument();
      expect(screen.getByText('Desc')).toBeInTheDocument();
      expect(screen.getByText('https://test.com')).toBeInTheDocument();
    });

    it('calls onApprove when approve button is clicked', async () => {
      const request = { id: '1', name: 'AssoTest' };
      render(<RequestCard request={request} onApprove={mockApprove} onReject={mockReject} />);
      fireEvent.click(screen.getByRole('button', { name: /Approuver/i }));
      await waitFor(() => expect(mockApprove).toHaveBeenCalledWith('1', ''));
    });

    it('alerts if rejected without a note', async () => {
      const request = { id: '1', name: 'AssoTest' };
      render(<RequestCard request={request} onApprove={mockApprove} onReject={mockReject} />);
      fireEvent.click(screen.getByRole('button', { name: /Refuser/i }));
      expect(window.alert).toHaveBeenCalledWith("Veuillez fournir une raison (note) pour le refus.");
      expect(mockReject).not.toHaveBeenCalled();
    });
  });

  describe('AssociationRequestForm', () => {
    it('submits form data correctly', async () => {
      const mockSubmit = jest.fn().mockResolvedValue(undefined);
      render(<AssociationRequestForm onSubmit={mockSubmit} isLoading={false} />);
      
      fireEvent.change(screen.getByLabelText(/Nom de l'association \*/i), { target: { value: 'New Asso' } });
      fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'We do good things.' } });
      fireEvent.change(screen.getByLabelText(/Site Web/i), { target: { value: 'https://newasso.com' } });
      
      fireEvent.click(screen.getByRole('button', { name: /Soumettre la demande/i }));
      
      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith({
          name: 'New Asso',
          description: 'We do good things.',
          website_url: 'https://newasso.com'
        });
      });
    });
  });
});