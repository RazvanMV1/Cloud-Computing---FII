export default function NewsCard({ article }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div style={styles.card}>
      {article.image_url && (
        <img
          src={article.image_url}
          alt={article.title}
          style={styles.image}
          onError={(e) => e.target.style.display = 'none'}
        />
      )}
      <div style={styles.content}>
        <div style={styles.meta}>
          <span style={styles.source}>{article.source}</span>
          <span style={styles.date}>{formatDate(article.published_at)}</span>
        </div>
        <h3 style={styles.title}>{article.title}</h3>
        {article.description && (
          <p style={styles.description}>
            {article.description.length > 120
              ? article.description.substring(0, 120) + '...'
              : article.description}
          </p>
        )}
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.link}
        >
          Citeste articolul
        </a>
      </div>
    </div>
  )
}

const styles = {
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  image: {
    width: '100%',
    height: '160px',
    objectFit: 'cover'
  },
  content: {
    padding: '1.2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    flex: 1
  },
  meta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.3rem'
  },
  source: {
    fontSize: '0.8rem',
    color: '#1a1a2e',
    fontWeight: 'bold'
  },
  date: {
    fontSize: '0.75rem',
    color: '#999'
  },
  title: {
    fontSize: '0.95rem',
    fontWeight: 'bold',
    color: '#1a1a2e',
    lineHeight: '1.4'
  },
  description: {
    fontSize: '0.85rem',
    color: '#666',
    lineHeight: '1.5'
  },
  link: {
    color: '#0066cc',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    marginTop: 'auto'
  }
}
