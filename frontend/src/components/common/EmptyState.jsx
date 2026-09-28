export default function EmptyState({ icon = '📋', title, description, action }) {
  return (
    <div className="card fade-in" style={{
      textAlign: 'center', padding: '3rem 2rem',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: '1rem',
    }}>
      <span style={{ fontSize: '3rem' }}>{icon}</span>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{title}</h3>
      {description && (
        <p style={{ color: 'var(--text-secondary)', maxWidth: 360, lineHeight: 1.6, fontSize: '0.875rem' }}>
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
