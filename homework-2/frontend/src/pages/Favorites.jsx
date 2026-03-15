import { useEffect, useState } from 'react'
import { getFavoriteCourses, getFavoriteArticles, removeFavoriteCourse, removeFavoriteArticle } from '../services/api'
import ErrorMessage from '../components/ErrorMessage'
import NewsCard from '../components/NewsCard'
import { SkeletonCard, SkeletonNewsCard } from '../components/Skeleton'

export default function Favorites() {
  const [courses, setCourses] = useState([])
  const [articles, setArticles] = useState([])
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [loadingArticles, setLoadingArticles] = useState(true)
  const [errorCourses, setErrorCourses] = useState(null)
  const [errorArticles, setErrorArticles] = useState(null)
  const [removingCourse, setRemovingCourse] = useState(null)
  const [removingArticle, setRemovingArticle] = useState(null)
  const [activeTab, setActiveTab] = useState('courses')

  const fetchFavoriteCourses = async () => {
    setLoadingCourses(true)
    setErrorCourses(null)
    try {
      const response = await getFavoriteCourses()
      setCourses(response.data.data || [])
    } catch (err) {
      setErrorCourses(err.message)
    } finally {
      setLoadingCourses(false)
    }
  }

  const fetchFavoriteArticles = async () => {
    setLoadingArticles(true)
    setErrorArticles(null)
    try {
      const response = await getFavoriteArticles()
      setArticles(response.data.data || [])
    } catch (err) {
      setErrorArticles(err.message)
    } finally {
      setLoadingArticles(false)
    }
  }

  const handleRemoveCourse = async (courseId) => {
    setRemovingCourse(courseId)
    try {
      await removeFavoriteCourse(courseId)
      setCourses(prev => prev.filter(c => c.id !== courseId))
    } catch (err) {
      alert('Eroare la stergerea cursului din favorite')
    } finally {
      setRemovingCourse(null)
    }
  }

  const handleRemoveArticle = async (articleUrl) => {
    setRemovingArticle(articleUrl)
    try {
      await removeFavoriteArticle(articleUrl)
      setArticles(prev => prev.filter(a => a.url !== articleUrl))
    } catch (err) {
      alert('Eroare la stergerea articolului din favorite')
    } finally {
      setRemovingArticle(null)
    }
  }

  useEffect(() => {
    fetchFavoriteCourses()
    fetchFavoriteArticles()
  }, [])

  return (
    <div style={styles.page}>
      <h1 style={styles.pageTitle}>Favorite</h1>

      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'courses' ? styles.tabActive : {})
          }}
          onClick={() => setActiveTab('courses')}
        >
          Cursuri
          {courses.length > 0 && (
            <span style={styles.tabBadge}>{courses.length}</span>
          )}
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'articles' ? styles.tabActive : {})
          }}
          onClick={() => setActiveTab('articles')}
        >
          Articole
          {articles.length > 0 && (
            <span style={styles.tabBadge}>{articles.length}</span>
          )}
        </button>
      </div>

      {activeTab === 'courses' && (
        <div style={styles.section}>
          {loadingCourses ? (
            <div style={styles.grid}>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : errorCourses ? (
            <ErrorMessage message={errorCourses} onRetry={fetchFavoriteCourses} />
          ) : courses.length === 0 ? (
            <div style={styles.empty}>
              <p style={styles.emptyText}>Nu ai niciun curs la favorite</p>
              <p style={styles.emptySubtext}>
                Mergi la pagina Cursuri si apasa butonul de favorite pe cursurile preferate
              </p>
            </div>
          ) : (
            <div style={styles.grid}>
              {courses.map(course => (
                <div key={course.id} style={styles.courseCard}>
                  <div style={styles.courseHeader}>
                    <h3 style={styles.courseTitle}>{course.title}</h3>
                    <button
                      style={styles.removeButton}
                      onClick={() => handleRemoveCourse(course.id)}
                      disabled={removingCourse === course.id}
                    >
                      {removingCourse === course.id ? '...' : 'X'}
                    </button>
                  </div>
                  <p style={styles.courseTeacher}>{course.teacher}</p>
                  {course.description && (
                    <p style={styles.courseDescription}>
                      {course.description.length > 100
                        ? course.description.substring(0, 100) + '...'
                        : course.description}
                    </p>
                  )}
                  <div style={styles.courseFooter}>
                    <span style={styles.courseBadge}>
                      {course.max_students} locuri
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'articles' && (
        <div style={styles.section}>
          {loadingArticles ? (
            <div style={styles.newsGrid}>
              <SkeletonNewsCard />
              <SkeletonNewsCard />
              <SkeletonNewsCard />
            </div>
          ) : errorArticles ? (
            <ErrorMessage message={errorArticles} onRetry={fetchFavoriteArticles} />
          ) : articles.length === 0 ? (
            <div style={styles.empty}>
              <p style={styles.emptyText}>Nu ai niciun articol la favorite</p>
              <p style={styles.emptySubtext}>
                Mergi la pagina Stiri si apasa butonul de favorite pe articolele preferate
              </p>
            </div>
          ) : (
            <div style={styles.newsGrid}>
              {articles.map((article, index) => (
                <div key={index} style={styles.articleWrapper}>
                  <NewsCard article={article} />
                  <button
                    style={styles.removeArticleButton}
                    onClick={() => handleRemoveArticle(article.url)}
                    disabled={removingArticle === article.url}
                  >
                    {removingArticle === article.url ? 'Se sterge...' : 'Sterge din favorite'}
                  </button>
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
  page: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  pageTitle: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: '1.5rem'
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '2rem',
    borderBottom: '2px solid #eee',
    paddingBottom: '0'
  },
  tab: {
    padding: '0.7rem 1.5rem',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: '0.95rem',
    color: '#888',
    fontWeight: '500',
    borderBottom: '2px solid transparent',
    marginBottom: '-2px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s'
  },
  tabActive: {
    color: '#1a1a2e',
    borderBottom: '2px solid #1a1a2e',
    fontWeight: 'bold'
  },
  tabBadge: {
    backgroundColor: '#4361ee',
    color: '#fff',
    fontSize: '0.75rem',
    padding: '0.1rem 0.5rem',
    borderRadius: '20px',
    fontWeight: 'bold'
  },
  section: {
    marginTop: '1rem'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1rem'
  },
  newsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1rem'
  },
  courseCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '1.2rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem'
  },
  courseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '0.5rem'
  },
  courseTitle: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#1a1a2e',
    flex: 1
  },
  removeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.1rem',
    padding: '0.2rem',
    borderRadius: '4px',
    flexShrink: 0,
    color: '#888'
  },
  courseTeacher: {
    fontSize: '0.85rem',
    color: '#555'
  },
  courseDescription: {
    fontSize: '0.85rem',
    color: '#666',
    lineHeight: '1.4'
  },
  courseFooter: {
    marginTop: 'auto'
  },
  courseBadge: {
    fontSize: '0.8rem',
    color: '#fff',
    backgroundColor: '#1a1a2e',
    padding: '0.2rem 0.7rem',
    borderRadius: '20px'
  },
  articleWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  removeArticleButton: {
    padding: '0.5rem',
    backgroundColor: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    color: '#856404',
    fontWeight: '500'
  },
  empty: {
    textAlign: 'center',
    padding: '4rem 2rem',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
  },
  emptyText: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: '0.5rem'
  },
  emptySubtext: {
    fontSize: '0.9rem',
    color: '#888'
  }
}
