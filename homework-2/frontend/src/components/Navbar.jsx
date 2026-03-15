import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()

  const links = [
    { path: '/', label: 'Dashboard' },
    { path: '/students', label: 'Studenti' },
    { path: '/courses', label: 'Cursuri' },
    { path: '/news', label: 'Stiri' },
    { path: '/favorites', label: 'Favorite' }
  ]

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>University Dashboard</div>
      <div style={styles.links}>
        {links.map(link => (
          <Link
            key={link.path}
            to={link.path}
            style={{
              ...styles.link,
              ...(location.pathname === link.path ? styles.activeLink : {})
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    backgroundColor: '#1a1a2e',
    padding: '0 2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '64px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
  },
  brand: {
    color: '#fff',
    fontSize: '1.3rem',
    fontWeight: 'bold'
  },
  links: {
    display: 'flex',
    gap: '0.5rem'
  },
  link: {
    color: '#ccc',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    fontSize: '0.95rem',
    transition: 'all 0.2s'
  },
  activeLink: {
    color: '#fff',
    backgroundColor: '#16213e'
  }
}
