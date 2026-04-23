import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import Courses from './pages/Courses'
import News from './pages/News'
import Favorites from './pages/Favorites'
import ActivityLog from './pages/ActivityLog'

export default function App() {
  return (
    <BrowserRouter>
      <div style={styles.app}>
        <Navbar />
        <main style={styles.main}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/news" element={<News />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/activity" element={<ActivityLog />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

function NotFound() {
  return (
    <div style={styles.notFound}>
      <h1 style={styles.notFoundCode}>404</h1>
      <p style={styles.notFoundMessage}>Pagina nu a fost gasita</p>
      <a href="/" style={styles.notFoundLink}>Inapoi la Dashboard</a>
    </div>
  )
}

const styles = {
  app: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column'
  },
  main: {
    flex: 1,
    backgroundColor: '#f0f2f5'
  },
  notFound: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    gap: '1rem'
  },
  notFoundCode: {
    fontSize: '6rem',
    fontWeight: 'bold',
    color: '#1a1a2e',
    lineHeight: 1
  },
  notFoundMessage: {
    fontSize: '1.2rem',
    color: '#888'
  },
  notFoundLink: {
    color: '#4361ee',
    fontSize: '1rem',
    fontWeight: 'bold'
  }
}