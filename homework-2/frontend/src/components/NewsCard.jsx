import { useState } from 'react'
import { translateText } from '../services/api'

export default function NewsCard({ article }) {
  const [translatedTitle, setTranslatedTitle] = useState(null)
  const [translatedDesc, setTranslatedDesc] = useState(null)
  const [translating, setTranslating] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)

  const handleTranslate = async () => {
    if (translatedTitle) {
      setShowOriginal(!showOriginal)
      return
    }
    setTranslating(true)
    try {
      const [titleRes, descRes] = await Promise.all([
        translateText(article.title, 'ro'),
        article.description ? translateText(article.description, 'ro') : Promise.resolve(null)
      ])
      setTranslatedTitle(titleRes.data.data.translated_text)
      if (descRes) setTranslatedDesc(descRes.data.data.translated_text)
      setShowOriginal(false)
    } catch (err) {
      console.error('Eroare traducere:', err)
    } finally {
      setTranslating(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const displayTitle = translatedTitle && !showOriginal ? translatedTitle : article.title
  const displayDesc = translatedDesc && !showOriginal ? translatedDesc : article.description

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
        <h3 style={styles.title}>{displayTitle}</h3>
        {displayDesc && (
          <p style={styles.description}>
            {displayDesc.length > 120
              ? displayDesc.substring(0, 120) + '...'
              : displayDesc}
          </p>
        )}
        <div style={styles.actions}>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.link}
          >
            Citeste articolul
          </a>
          <button
            style={styles.translateBtn}
            onClick={handleTranslate}
            disabled={translating}
          >
            {translating ? '...' : translatedTitle ? (showOriginal ? 'Traducere' : 'Original') : 'Traduce'}
          </button>
        </div>
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
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto'
  },
  link: {
    color: '#0066cc',
    fontSize: '0.85rem',
    fontWeight: 'bold'
  },
  translateBtn: {
    padding: '0.3rem 0.7rem',
    backgroundColor: '#e8f4fd',
    color: '#0078d4',
    border: '1px solid #0078d4',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: 'bold'
  }
}