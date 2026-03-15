export default function ErrorMessage({ message, onRetry }) {
  return (
    <div style={styles.container}>
      <div style={styles.icon}>!</div>
      <p style={styles.message}>{message || 'A aparut o eroare neasteptata'}</p>
      {onRetry && (
        <button style={styles.button} onClick={onRetry}>
          Incearca din nou
        </button>
      )}
    </div>
  )
}

const styles = {
  container: {
    backgroundColor: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: '8px',
    padding: '1.5rem',
    textAlign: 'center',
    margin: '1rem 0'
  },
  icon: {
    fontSize: '2rem',
    marginBottom: '0.5rem',
    color: '#856404',
    fontWeight: 'bold'
  },
  message: {
    color: '#856404',
    fontSize: '0.95rem',
    marginBottom: '1rem'
  },
  button: {
    backgroundColor: '#ffc107',
    border: 'none',
    borderRadius: '6px',
    padding: '0.5rem 1.2rem',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.9rem'
  }
}
