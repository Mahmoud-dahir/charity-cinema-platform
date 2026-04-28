// src/components/__tests__/ui.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

describe('UI Components', () => {
  it('renders Input correctly and applies custom classes', () => {
    render(<Input placeholder="Test Input" className="custom-input-class" />);
    const input = screen.getByPlaceholderText('Test Input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('custom-input-class');
  });

  it('renders Label correctly and applies custom classes', () => {
    render(<Label className="custom-label-class">Test Label</Label>);
    const label = screen.getByText('Test Label');
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass('custom-label-class');
  });
});