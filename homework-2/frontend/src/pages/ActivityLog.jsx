import { useEffect, useState } from 'react'
import { getActivityLog, getRecentEvents } from '../services/api'
import ErrorMessage from '../components/ErrorMessage'

export default function ActivityLog() {
  const [logs, setLogs] = useState([])
  const [events, setEvents] = useState([])
  const [loadingLogs, setLoadingLogs] = useState(true)
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [errorLogs, setErrorLogs] = useState(null)
  const [errorEvents, setErrorEvents] = useState(null)
  const [activeTab, setActiveTab] = useState('logs')

  const fetchLogs = async () => {
    setLoadingLogs(true)
    setErrorLogs(null)
    try {
      const response = await getActivityLog(null, 50)
      setLogs(response.data.data || [])
    } catch (err) {
      setErrorLogs(err.message)
    } finally {
      setLoadingLogs(false)
    }
  }

  const fetchEvents = async () => {
    setLoadingEvents(true)
    setErrorEvents(null)
    try {
      const response = await getRecentEvents()
      setEvents(response.data.data || [])
    } catch (err) {
      setErrorEvents(err.message)
    } finally {
      setLoadingEvents(false)
    }
  }

  useEffect(() => {
    fetchLogs()
    fetchEvents()
  }, [])

  const getActionColor = (action) => {
    if (action.includes('ADDED') || action.includes('UPLOADED')) return '#28a745'
    if (action.includes('REMOVED') || action.includes('DELETED')) return '#dc3545'
    return '#4361ee'
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleString('ro-RO')
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.pageTitle}>Monitorizare Azure</h1>
      <p style={styles.subtitle}>Activity Log (Table Storage) si Events (Queue Storage)</p>

      <div style={styles.tabs}>
        <button
          style={{ ...styles.tab, ...(activeTab === 'logs' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('logs')}
        >
          Activity Log
          {logs.length > 0 && <span style={styles.tabBadge}>{logs.length}</span>}
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'events' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('events')}
        >
          Queue Events
          {events.length > 0 && <span style={styles.tabBadge}>{events.length}</span>}
        </button>
      </div>

      {activeTab === 'logs' && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Azure Table Storage - Activity Log</h2>
            <button style={styles.refreshButton} onClick={fetchLogs}>Refresh</button>
          </div>
          {loadingLogs ? (
            <p style={styles.loading}>Se incarca...</p>
          ) : errorLogs ? (
            <ErrorMessage message={errorLogs} onRetry={fetchLogs} />
          ) : logs.length === 0 ? (
            <div style={styles.empty}><p>Nicio activitate inregistrata azi</p></div>
          ) : (
            <div style={styles.logList}>
              {logs.map((log, index) => (
                <div key={index} style={styles.logItem}>
                  <div style={{
                    ...styles.actionBadge,
                    backgroundColor: getActionColor(log.action)
                  }}>
                    {log.action}
                  </div>
                  <div style={styles.logDetails}>{log.details}</div>
                  <div style={styles.logTime}>{formatTime(log.timestamp)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'events' && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Azure Queue Storage - Events</h2>
            <button style={styles.refreshButton} onClick={fetchEvents}>Refresh</button>
          </div>
          {loadingEvents ? (
            <p style={styles.loading}>Se incarca...</p>
          ) : errorEvents ? (
            <ErrorMessage message={errorEvents} onRetry={fetchEvents} />
          ) : events.length === 0 ? (
            <div style={styles.empty}><p>Niciun event in queue</p></div>
          ) : (
            <div style={styles.logList}>
              {events.map((event, index) => (
                <div key={index} style={styles.logItem}>
                  <div style={{
                    ...styles.actionBadge,
                    backgroundColor: getActionColor(event.event_type || '')
                  }}>
                    {event.event_type}
                  </div>
                  <div style={styles.logDetails}>{JSON.stringify(event.data)}</div>
                  <div style={styles.logTime}>{formatTime(event.timestamp)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const styles = {
  page: { padding: '2rem', maxWidth: '1200px', margin: '0 auto' },
  pageTitle: { fontSize: '1.8rem', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '0.3rem' },
  subtitle: { color: '#888', marginBottom: '1.5rem', fontSize: '0.95rem' },
  tabs: { display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '2px solid #eee' },
  tab: {
    padding: '0.7rem 1.5rem', border: 'none', background: 'none', cursor: 'pointer',
    fontSize: '0.95rem', color: '#888', fontWeight: '500', borderBottom: '2px solid transparent',
    marginBottom: '-2px', display: 'flex', alignItems: 'center', gap: '0.5rem'
  },
  tabActive: { color: '#1a1a2e', borderBottom: '2px solid #1a1a2e', fontWeight: 'bold' },
  tabBadge: {
    backgroundColor: '#4361ee', color: '#fff', fontSize: '0.75rem',
    padding: '0.1rem 0.5rem', borderRadius: '20px', fontWeight: 'bold'
  },
  section: { marginTop: '1rem' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  sectionTitle: { fontSize: '1.1rem', fontWeight: 'bold', color: '#1a1a2e' },
  refreshButton: {
    padding: '0.5rem 1rem', backgroundColor: '#f0f2f5', border: '1px solid #ddd',
    borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem'
  },
  logList: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  logItem: {
    backgroundColor: '#fff', borderRadius: '10px', padding: '1rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center',
    gap: '1rem', flexWrap: 'wrap'
  },
  actionBadge: {
    color: '#fff', fontSize: '0.75rem', padding: '0.3rem 0.7rem',
    borderRadius: '20px', fontWeight: 'bold', whiteSpace: 'nowrap'
  },
  logDetails: { flex: 1, fontSize: '0.85rem', color: '#555', wordBreak: 'break-all' },
  logTime: { fontSize: '0.8rem', color: '#aaa', whiteSpace: 'nowrap' },
  loading: { color: '#999', textAlign: 'center', padding: '2rem' },
  empty: { textAlign: 'center', color: '#888', padding: '3rem', backgroundColor: '#fff', borderRadius: '12px' }
}