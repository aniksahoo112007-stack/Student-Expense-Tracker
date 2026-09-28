export function SkeletonCard({ height = 120, count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="skeleton" style={{ height, width: '100%' }} />
        </div>
      ))}
    </>
  );
}

export function SkeletonLine({ width = '100%', height = 16, style = {} }) {
  return <div className="skeleton" style={{ width, height, ...style }} />;
}

export function SkeletonGrid({ cards = 4, height = 120 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
      {Array.from({ length: cards }).map((_, i) => (
        <SkeletonCard key={i} height={height} />
      ))}
    </div>
  );
}
