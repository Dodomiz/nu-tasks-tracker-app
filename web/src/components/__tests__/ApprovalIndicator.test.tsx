import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ApprovalIndicator } from '../ApprovalIndicator';

describe('ApprovalIndicator', () => {
  it('renders shield icon when requiresApproval is true', () => {
    render(<ApprovalIndicator requiresApproval={true} size="md" />);
    
    const icon = screen.getByLabelText('tasks.approval.requiresApproval');
    expect(icon).toBeInTheDocument();
  });

  it('does not render when requiresApproval is false', () => {
    const { container } = render(<ApprovalIndicator requiresApproval={false} size="md" />);
    
    expect(container.firstChild).toBeNull();
  });

  it('renders with small size', () => {
    render(<ApprovalIndicator requiresApproval={true} size="sm" />);
    
    const icon = screen.getByLabelText('tasks.approval.requiresApproval');
    expect(icon).toHaveClass('h-4', 'w-4');
  });

  it('renders with medium size by default', () => {
    render(<ApprovalIndicator requiresApproval={true} />);
    
    const icon = screen.getByLabelText('tasks.approval.requiresApproval');
    expect(icon).toHaveClass('h-5', 'w-5');
  });

  it('renders with large size', () => {
    render(<ApprovalIndicator requiresApproval={true} size="lg" />);
    
    const icon = screen.getByLabelText('tasks.approval.requiresApproval');
    expect(icon).toHaveClass('h-6', 'w-6');
  });

  it('has amber color', () => {
    render(<ApprovalIndicator requiresApproval={true} size="md" />);
    
    const icon = screen.getByLabelText('tasks.approval.requiresApproval');
    expect(icon).toHaveClass('text-amber-600');
  });

  it('shows tooltip on hover', () => {
    render(<ApprovalIndicator requiresApproval={true} size="md" />);
    
    // Tooltip text should be in the DOM
    expect(screen.getByText('tasks.approval.tooltip')).toBeInTheDocument();
  });
});
