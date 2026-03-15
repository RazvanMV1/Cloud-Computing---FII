import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import WeatherWidget from '../components/WeatherWidget'
import NewsCard from '../components/NewsCard'
import ErrorMessage from '../components/ErrorMessage'
import { SkeletonStatCard, SkeletonChartCard, SkeletonNewsCard } from '../components/Skeleton'
import { getStudents, getCourses, getEnrollments, getEducationNews, getEnrollmentsByStatus, getStudentsPerCourse, getWeatherForecast } from '../services/api'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [news, setNews] = useState([])
  const [enrollmentsByStatus, setEnrollmentsByStatus] = useState([])
  const [studentsPerCourse, setStudentsPerCourse] = useState([])
  const [forecast, setForecast] = useState(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingNews, setLoadingNews] = useState(true)
  const [loadingCharts, setLoadingCharts] = useState(true)
  const [loadingForecast, setLoadingForecast] = useState(true)
  const [errorStats, setErrorStats] = useState(null)
  const [errorNews, setErrorNews] = useState(null)
  const [errorCharts, setErrorCharts] = useState(null)
  const [errorForecast, setErrorForecast] = useState(null)

  const fetchStats = async () => {
    setLoadingStats(true)
    setErrorStats(null)
    try {
      const [studentsRes, coursesRes, enrollmentsRes] = await Promise.all([
        getStudents({ limit: 1 }),
        getCourses({ limit: 1 }),
        getEnrollments({ limit: 1 })
      ])
      setStats({
        students: studentsRes.data.pagination?.total || 0,
        courses: coursesRes.data.pagination?.total || 0,
        enrollments: enrollmentsRes.data.pagination?.total || 0
      })
    } catch (err) {
      setErrorStats(err.message)
    } finally {
      setLoadingStats(false)
    }
  }

  const fetchCharts = async () => {
    setLoadingCharts(true)
    setErrorCharts(null)
    try {
      const [statusRes, perCourseRes] = await Promise.all([
        getEnrollmentsByStatus(),
        getStudentsPerCourse()
      ])
      setEnrollmentsByStatus(statusRes.data.data || [])
      setStudentsPerCourse(perCourseRes.data.data || [])
    } catch (err) {
      setErrorCharts(err.message)
    } finally {
      setLoadingCharts(false)
    }
  }

  const fetchNews = async () => {
    setLoadingNews(true)
    setErrorNews(null)
    try {
      const response = await getEducationNews({ page: 1, page_size: 3 })
      setNews(response.data.articles || [])
    } catch (err) {
      setErrorNews(err.message)
    } finally {
      setLoadingNews(false)
    }
  }

  const fetchForecast = async () => {
    setLoadingForecast(true)
    setErrorForecast(null)
    try {
      const response = await getWeatherForecast()
      setForecast(response.data)
    } catch (err) {
      setErrorForecast(err.message)
    } finally {
      setLoadingForecast(false)
    }
  }

  useEffect(() => {
    fetchStats()
    fetchCharts()
    fetchNews()
    fetchForecast()
  }, [])

  const statCards = [
    { label: 'Studenti', value: stats?.students, color: '#4361ee' },
    { label: 'Cursuri', value: stats?.courses, color: '#3a0ca3' },
    { label: 'Inscrieri', value: stats?.enrollments, color: '#7209b7' }
  ]

  const formatDay = (datetime) => {
    const date = new Date(datetime)
    return date.toLocaleDateString('ro-RO', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  const formatHour = (datetime) => {
    const date = new Date(datetime)
    return date.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })
  }

  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={styles.tooltip}>
          <p style={styles.tooltipLabel}>{payload[0]?.payload?.full_name || label}</p>
          <p style={{ color: '#4361ee', margin: 0 }}>Inscrisi: {payload[0]?.value}</p>
          <p style={{ color: '#aaa', margin: 0 }}>Maxim: {payload[1]?.value}</p>
        </div>
      )
    }
    return null
  }

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={styles.tooltip}>
          <p style={{ ...styles.tooltipLabel, color: payload[0].payload.color }}>
            {payload[0].name}
          </p>
          <p style={{ margin: 0 }}>Total: {payload[0].value}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.pageTitle}>Dashboard</h1>
      <p style={styles.pageSubtitle}>Bine ai venit! Iata un sumar al sistemului universitar.</p>

      <div style={styles.statsGrid}>
        {loadingStats ? (
          <>
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </>
        ) : errorStats ? (
          <div style={{ gridColumn: '1 / -1' }}>
            <ErrorMessage message={errorStats} onRetry={fetchStats} />
          </div>
        ) : (
          statCards.map(card => (
            <div key={card.label} style={{ ...styles.statCard, borderTop: `4px solid ${card.color}` }}>
              <div style={styles.statInfo}>
                <span style={styles.statValue}>{card.value}</span>
                <span style={styles.statLabel}>{card.label}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={styles.chartsGrid}>
        <div style={styles.chartCard}>
          <h2 style={styles.sectionTitle}>Studenti per Curs</h2>
          {loadingCharts ? (
            <SkeletonChartCard />
          ) : errorCharts ? (
            <ErrorMessage message={errorCharts} onRetry={fetchCharts} />
          ) : studentsPerCourse.length === 0 ? (
            <p style={styles.loading}>Nu exista date disponibile</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={studentsPerCourse} margin={{ top: 5, right: 10, left: -20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#666' }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: '#666' }} />
                <Tooltip content={<CustomBarTooltip />} />
                <Legend
                  verticalAlign="top"
                  formatter={(value) => value === 'enrolled' ? 'Inscrisi' : 'Maxim'}
                />
                <Bar dataKey="enrolled" name="enrolled" fill="#4361ee" radius={[4, 4, 0, 0]} />
                <Bar dataKey="max" name="max" fill="#e0e0e0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={styles.chartCard}>
          <h2 style={styles.sectionTitle}>Distributie Inscrieri</h2>
          {loadingCharts ? (
            <SkeletonChartCard />
          ) : errorCharts ? (
            <ErrorMessage message={errorCharts} onRetry={fetchCharts} />
          ) : enrollmentsByStatus.length === 0 ? (
            <p style={styles.loading}>Nu exista date disponibile</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={enrollmentsByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="status"
                  label={({ status, value }) => `${status}: ${value}`}
                  labelLine={false}
                >
                  {enrollmentsByStatus.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div style={styles.mainGrid}>
        <div style={styles.weatherColumn}>
          <h2 style={styles.sectionTitle}>Vremea pe Campus</h2>
          <WeatherWidget />

          <h2 style={{ ...styles.sectionTitle, marginTop: '1.5rem' }}>Prognoza</h2>
          {loadingForecast ? (
            <div style={styles.forecastList}>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} style={styles.forecastSkeletonItem}>
                  <div style={{ ...styles.shimmer, width: '70px', height: '32px', borderRadius: '4px' }} />
                  <div style={{ ...styles.shimmer, width: '40px', height: '40px', borderRadius: '50%' }} />
                  <div style={{ ...styles.shimmer, width: '50px', height: '24px', borderRadius: '4px' }} />
                  <div style={{ ...styles.shimmer, flex: 1, height: '14px', borderRadius: '4px' }} />
                </div>
              ))}
            </div>
          ) : errorForecast ? (
            <ErrorMessage message={errorForecast} onRetry={fetchForecast} />
          ) : forecast && (
            <div style={styles.forecastList}>
              {forecast.forecast.map((item, index) => (
                <div key={index} style={styles.forecastItem}>
                  <div style={styles.forecastTime}>
                    <span style={styles.forecastDay}>{formatDay(item.datetime)}</span>
                    <span style={styles.forecastHour}>{formatHour(item.datetime)}</span>
                  </div>
                  <img src={item.icon_url} alt={item.description} style={styles.forecastIcon} />
                  <div style={styles.forecastTemp}>{Math.round(item.temperature)}°C</div>
                  <div style={styles.forecastDesc}>{item.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.newsColumn}>
          <h2 style={styles.sectionTitle}>Stiri Educatie</h2>
          {loadingNews ? (
            <div style={styles.newsGrid}>
              <SkeletonNewsCard />
              <SkeletonNewsCard />
              <SkeletonNewsCard />
            </div>
          ) : errorNews ? (
            <ErrorMessage message={errorNews} onRetry={fetchNews} />
          ) : (
            <div style={styles.newsGrid}>
              {news.map((article, index) => (
                <NewsCard key={index} article={article} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const shimmerStyle = {
  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite'
}

const styles = {
  page: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  pageTitle: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: '0.3rem'
  },
  pageSubtitle: {
    color: '#888',
    marginBottom: '2rem',
    fontSize: '0.95rem'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginBottom: '2rem'
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
  statInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#1a1a2e'
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#888'
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '320px 1fr',
    gap: '2rem',
    alignItems: 'start'
  },
  weatherColumn: {
    display: 'flex',
    flexDirection: 'column'
  },
  newsColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: '1rem'
  },
  forecastList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  forecastItem: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '0.8rem 1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
  },
  forecastSkeletonItem: {
    backgroundColor: '#fff',
    borderRadius: '10px',
    padding: '0.8rem 1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
  },
  forecastTime: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: '70px'
  },
  forecastDay: {
    fontSize: '0.8rem',
    fontWeight: 'bold',
    color: '#1a1a2e'
  },
  forecastHour: {
    fontSize: '0.75rem',
    color: '#aaa'
  },
  forecastIcon: {
    width: '40px',
    height: '40px'
  },
  forecastTemp: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#1a1a2e',
    minWidth: '50px'
  },
  forecastDesc: {
    fontSize: '0.82rem',
    color: '#666',
    textTransform: 'capitalize',
    flex: 1
  },
  newsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1rem'
  },
  tooltip: {
    backgroundColor: '#fff',
    border: '1px solid #eee',
    borderRadius: '8px',
    padding: '0.8rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  tooltipLabel: {
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: '0.3rem',
    fontSize: '0.85rem'
  },
  shimmer: shimmerStyle,
  loading: {
    color: '#999',
    textAlign: 'center',
    padding: '2rem',
    fontSize: '0.95rem'
  }
}
