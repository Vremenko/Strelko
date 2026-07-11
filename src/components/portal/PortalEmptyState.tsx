interface PortalEmptyStateProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function PortalEmptyState({ title, description, children }: PortalEmptyStateProps) {
  return (
    <div className="portal-empty-state legal-card">
      <h2 className="portal-empty-state__title">{title}</h2>
      <p className="portal-empty-state__text">{description}</p>
      {children}
    </div>
  );
}
