import { useState } from 'react'

export default function FavoriteButton({ isFavorite, onAdd, onRemove, size = 'normal' }) {
  const [loading, setLoading] = useState(false)

  const handleClick = async (e) => {
    e.stopPropagation()
    setLoading(true)
    try {
      if (isFavorite) {
        await onRemove()
      } else {
        await onAdd()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      style={{
        ...styles.button,
        ...(size === 'small' ? styles.buttonSmall : {}),
        ...(isFavorite ? styles.buttonActive : {})
      }}
      onClick={handleClick}
      disabled={loading}
      title={isFavorite ? 'Sterge din favorite' : 'Adauga la favorite'}
    >
      {loading ? '...' : isFavorite ? '*' : 'o'}
    </button>
  )
}

const styles = {
  button: {
    background: 'none',
    border: '1px solid #ddd',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    padding: '0.3rem 0.6rem',
    transition: 'all 0.2s',
    flexShrink: 0
  },
  buttonSmall: {
    fontSize: '0.9rem',
    padding: '0.2rem 0.5rem'
  },
  buttonActive: {
    border: '1px solid #ffc107',
    backgroundColor: '#fff9e6'
  }
}
