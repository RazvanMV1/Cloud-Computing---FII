export function SkeletonCard() {
  return (
    <div style={styles.card}>
      <div style={{ ...styles.shimmer, width: '48px', height: '48px', borderRadius: '50%' }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ ...styles.shimmer, width: '60%', height: '16px', borderRadius: '4px' }} />
        <div style={{ ...styles.shimmer, width: '80%', height: '12px', borderRadius: '4px' }} />
        <div style={{ ...styles.shimmer, width: '40%', height: '12px', borderRadius: '4px' }} />
      </div>
    </div>
  )
}

export function SkeletonNewsCard() {
  return (
    <div style={styles.newsCard}>
      <div style={{ ...styles.shimmer, width: '100%', height: '160px' }} />
      <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <div style={{ ...styles.shimmer, width: '40%', height: '12px', borderRadius: '4px' }} />
        <div style={{ ...styles.shimmer, width: '100%', height: '16px', borderRadius: '4px' }} />
        <div style={{ ...styles.shimmer, width: '90%', height: '16px', borderRadius: '4px' }} />
        <div style={{ ...styles.shimmer, width: '70%', height: '12px', borderRadius: '4px' }} />
      </div>
    </div>
  )
}

export function SkeletonStatCard() {
  return (
    <div style={styles.statCard}>
      <div style={{ ...styles.shimmer, width: '48px', height: '48px', borderRadius: '8px' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ ...styles.shimmer, width: '80px', height: '32px', borderRadius: '4px' }} />
        <div style={{ ...styles.shimmer, width: '60px', height: '14px', borderRadius: '4px' }} />
      </div>
    </div>
  )
}

export function SkeletonChartCard() {
  return (
    <div style={styles.chartCard}>
      <div style={{ ...styles.shimmer, width: '40%', height: '20px', borderRadius: '4px', marginBottom: '1rem' }} />
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '180px', padding: '0 1rem' }}>
        {[60, 90, 45, 120, 80, 100, 70, 55].map((h, i) => (
          <div key={i} style={{ ...styles.shimmer, flex: 1, height: `${h}px`, borderRadius: '4px 4px 0 0' }} />
        ))}
      </div>
    </div>
  )
}

export function SkeletonWeatherCard() {
  return (
    <div style={styles.weatherCard}>
      <div style={{ ...styles.shimmer, width: '50%', height: '18px', borderRadius: '4px', marginBottom: '1rem' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.8rem' }}>
        <div style={{ ...styles.shimmer, width: '64px', height: '64px', borderRadius: '50%' }} />
        <div style={{ ...styles.shimmer, width: '80px', height: '48px', borderRadius: '4px' }} />
      </div>
      <div style={{ ...styles.shimmer, width: '60%', height: '14px', borderRadius: '4px', marginBottom: '1rem' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ ...styles.shimmer, height: '48px', borderRadius: '8px' }} />
        ))}
      </div>
    </div>
  )
}

const shimmerKeyframes = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`

const styleTag = document.createElement('style')
styleTag.textContent = shimmerKeyframes
document.head.appendChild(styleTag)

const styles = {
  shimmer: {
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '1.2rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  newsCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    overflow: 'hidden'
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  weatherCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  }
}
