import React from 'react';
import { render, screen } from '@testing-library/react';
import { Sidebar } from '../../components/dashboard/Sidebar';

// On simule usePathname pour contrôler quel lien est "actif"
let mockPathname = '/dashboard';
jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname
}));

describe('Sidebar Component', () => {
  it('affiche les liens de base pour un utilisateur normal', () => {
    mockPathname = '/dashboard';
    render(<Sidebar user={{ has_association: false, is_staff: false }} />);
    
    expect(screen.getByText('Tableau de bord')).toBeInTheDocument();
    expect(screen.getByText('Favoris')).toBeInTheDocument();
    
    // Il n'a pas d'asso et n'est pas staff, ces liens doivent être absents
    expect(screen.queryByText('Mes événements')).not.toBeInTheDocument();
    expect(screen.queryByText('Panel Admin')).not.toBeInTheDocument();
  });

  it('affiche le lien Mes événements si l\'utilisateur a une asso', () => {
    render(<Sidebar user={{ has_association: true, is_staff: false }} />);
    expect(screen.getByText('Mes événements')).toBeInTheDocument();
  });

  it('affiche le lien Panel Admin si l\'utilisateur est staff', () => {
    render(<Sidebar user={{ has_association: false, is_staff: true }} />);
    expect(screen.getByText('Panel Admin')).toBeInTheDocument();
  });

  it('met en surbrillance le lien actif', () => {
    mockPathname = '/dashboard/favorites';
    render(<Sidebar user={{}} />);
    
    const favLink = screen.getByText('Favoris').closest('a');
    // On vérifie qu'il a bien la classe jaune qui indique qu'il est actif
    expect(favLink).toHaveClass('bg-yellow-50');
  });
});