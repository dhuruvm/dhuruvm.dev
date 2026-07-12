import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <div className="blankslate">
    <div className="blankslate-icon">{icon}</div>
    <h3 className="blankslate-title">{title}</h3>
    <p className="blankslate-description">{description}</p>
    {action && <div className="blankslate-action">{action}</div>}
  </div>
);
