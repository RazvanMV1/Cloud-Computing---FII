import { useEffect, useState } from 'react'
import { getCurrentWeather } from '../services/api'
import { SkeletonWeatherCard } from './Skeleton'
import ErrorMessage from './ErrorMessage'

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchWeather = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getCurrentWeather()
      setWeather(response.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWeather()
  }, [])

  if (loading) return <SkeletonWeatherCard />
  if (error) return <div style={styles.card}><ErrorMessage message={error} onRetry={fetchWeather} /></div>

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Vremea in {weather.city}</h3>
      <div style={styles.main}>
        <img src={weather.icon_url} alt={weather.description} style={styles.icon} />
        <div style={styles.temp}>{Math.round(weather.temperature)}°C</div>
      </div>
      <p style={styles.description}>{weather.description}</p>
      <div style={styles.details}>
        <div style={styles.detail}>
          <span style={styles.detailLabel}>Simte ca</span>
          <span>{Math.round(weather.feels_like)}°C</span>
        </div>
        <div style={styles.detail}>
          <span style={styles.detailLabel}>Umiditate</span>
          <span>{weather.humidity}%</span>
        </div>
        <div style={styles.detail}>
          <span style={styles.detailLabel}>Vant</span>
          <span>{weather.wind_speed} m/s</span>
        </div>
        <div style={styles.detail}>
          <span style={styles.detailLabel}>Presiune</span>
          <span>{weather.pressure} hPa</span>
        </div>
      </div>
    </div>
  )
}

const styles = {
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    height: '100%'
  },
  title: {
    fontSize: '1rem',
    color: '#555',
    marginBottom: '1rem'
  },
  main: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  icon: {
    width: '64px',
    height: '64px'
  },
  temp: {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: '#1a1a2e'
  },
  description: {
    color: '#777',
    textTransform: 'capitalize',
    marginBottom: '1rem',
    fontSize: '0.95rem'
  },
  details: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.5rem'
  },
  detail: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    padding: '0.5rem 0.8rem',
    fontSize: '0.9rem'
  },
  detailLabel: {
    color: '#999',
    fontSize: '0.75rem',
    marginBottom: '2px'
  }
}
