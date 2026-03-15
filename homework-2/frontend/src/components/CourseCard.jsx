export default function CourseCard({ course, onClick }) {
  const getStatusColor = (maxStudents) => {
    if (maxStudents > 50) return '#28a745'
    if (maxStudents > 20) return '#ffc107'
    return '#dc3545'
  }

  return (
    <div style={styles.card} onClick={onClick}>
      <div style={styles.header}>
        <h3 style={styles.title}>{course.title}</h3>
        <span style={{
          ...styles.badge,
          backgroundColor: getStatusColor(course.max_students)
        }}>
          {course.max_students} locuri
        </span>
      </div>
      {course.description && (
        <p style={styles.description}>
          {course.description.length > 100
            ? course.description.substring(0, 100) + '...'
            : course.description}
        </p>
      )}
      <div style={styles.footer}>
        <span style={styles.teacher}>{course.teacher}</span>
        <span style={styles.arrow}>→</span>
      </div>
    </div>
  )
}

const styles = {
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '1.2rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '0.5rem'
  },
  title: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#1a1a2e',
    flex: 1
  },
  badge: {
    color: '#fff',
    fontSize: '0.75rem',
    padding: '0.2rem 0.6rem',
    borderRadius: '20px',
    fontWeight: 'bold',
    whiteSpace: 'nowrap'
  },
  description: {
    fontSize: '0.85rem',
    color: '#666',
    lineHeight: '1.4'
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  teacher: {
    fontSize: '0.85rem',
    color: '#555'
  },
  arrow: {
    color: '#ccc',
    fontSize: '1.2rem'
  }
}
