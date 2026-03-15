export default function StudentCard({ student, onClick }) {
  return (
    <div style={styles.card} onClick={onClick}>
      <div style={styles.avatar}>
        {student.name.charAt(0).toUpperCase()}
      </div>
      <div style={styles.info}>
        <h3 style={styles.name}>{student.name}</h3>
        <p style={styles.email}>{student.email}</p>
        <p style={styles.age}>{student.age} ani</p>
      </div>
      <div style={styles.arrow}>→</div>
    </div>
  )
}

const styles = {
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '1.2rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  avatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#1a1a2e',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.3rem',
    fontWeight: 'bold',
    flexShrink: 0
  },
  info: {
    flex: 1
  },
  name: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: '0.3rem'
  },
  email: {
    fontSize: '0.85rem',
    color: '#666',
    marginBottom: '0.2rem'
  },
  age: {
    fontSize: '0.85rem',
    color: '#666'
  },
  arrow: {
    color: '#ccc',
    fontSize: '1.2rem'
  }
}
