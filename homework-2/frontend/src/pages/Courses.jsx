import { useEffect, useState } from 'react'
import CourseCard from '../components/CourseCard'
import NewsCard from '../components/NewsCard'
import ErrorMessage from '../components/ErrorMessage'
import FavoriteButton from '../components/FavoriteButton'
import { getCourses, getCourseById, getCourseAverage, getNewsByTopic, getFavoriteCourses, addFavoriteCourse, removeFavoriteCourse } from '../services/api'

const translateTitle = (title) => {
  const translations = {
    'matematica': 'mathematics',
    'fizica': 'physics',
    'chimie': 'chemistry',
    'biologie': 'biology',
    'informatica': 'computer science',
    'programare': 'programming',
    'retele': 'computer networks',
    'baze de date': 'database',
    'sisteme de operare': 'operating systems',
    'algebra': 'algebra',
    'geometrie': 'geometry',
    'analiza': 'mathematical analysis',
    'securitate': 'cybersecurity',
    'inteligenta artificiala': 'artificial intelligence',
    'machine learning': 'machine learning',
    'cloud computing': 'cloud computing',
    'web development': 'web development',
    'data science': 'data science',
    'cybersecurity': 'cybersecurity',
    'artificial intelligence': 'artificial intelligence',
    'database systems': 'database systems',
    'computer networks': 'computer networks',
    'software engineering': 'software engineering',
    'operating systems': 'operating systems'
  }
  const lower = title.toLowerCase()
  return translations[lower] || title
}

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [teacherSearch, setTeacherSearch] = useState('')
  const [page, setPage] = useState(1)

  const [selectedCourse, setSelectedCourse] = useState(null)
  const [courseAverage, setCourseAverage] = useState(null)
  const [courseNews, setCourseNews] = useState([])
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [errorDetail, setErrorDetail] = useState(null)

  const [favoriteCourseIds, setFavoriteCourseIds] = useState([])

  const fetchCourses = async (title = '', teacher = '', currentPage = 1) => {
    setLoading(true)
    setError(null)
    try {
      const params = { page: currentPage, limit: 9 }
      if (title) params.title = title
      if (teacher) params.teacher = teacher
      const response = await getCourses(params)
      setCourses(response.data.data || [])
      setPagination(response.data.pagination || null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchFavorites = async () => {
    try {
      const response = await getFavoriteCourses()
      const ids = (response.data.data || []).map(c => c.id)
      setFavoriteCourseIds(ids)
    } catch (err) {
      console.error('Nu s-au putut incarca favoritele:', err)
    }
  }

  const fetchCourseDetail = async (courseId, courseTitle) => {
    setLoadingDetail(true)
    setErrorDetail(null)
    setCourseAverage(null)
    setCourseNews([])
    try {
      const newsTitle = translateTitle(courseTitle)
      const [courseRes, averageRes, newsRes] = await Promise.all([
        getCourseById(courseId),
        getCourseAverage(courseId),
        getNewsByTopic(newsTitle, 3)
      ])
      setSelectedCourse(courseRes.data.data || courseRes.data)
      setCourseAverage(averageRes.data.data?.statistics || averageRes.data.statistics || null)
      setCourseNews(newsRes.data.articles || [])
    } catch (err) {
      setErrorDetail(err.message)
    } finally {
      setLoadingDetail(false)
    }
  }

  useEffect(() => {
    fetchCourses(search, teacherSearch, page)
    fetchFavorites()
  }, [page])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchCourses(search, teacherSearch, 1)
  }

  const handleCardClick = (course) => {
    fetchCourseDetail(course.id, course.title)
  }

  const closeModal = () => {
    setSelectedCourse(null)
    setCourseAverage(null)
    setCourseNews([])
    setErrorDetail(null)
  }

  const handleToggleFavorite = async (course) => {
    try {
      if (favoriteCourseIds.includes(course.id)) {
        await removeFavoriteCourse(course.id)
        setFavoriteCourseIds(prev => prev.filter(id => id !== course.id))
      } else {
        await addFavoriteCourse({
          id: course.id,
          title: course.title,
          teacher: course.teacher,
          description: course.description || '',
          max_students: course.max_students
        })
        setFavoriteCourseIds(prev => [...prev, course.id])
      }
    } catch (err) {
      console.error('Eroare la favorite:', err)
    }
  }

  const getAverageColor = (avg) => {
    if (!avg) return '#888'
    if (avg >= 8) return '#28a745'
    if (avg >= 5) return '#ffc107'
    return '#dc3545'
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.pageTitle}>Cursuri</h1>

      <form onSubmit={handleSearch} style={styles.searchForm}>
        <input
          type="text"
          placeholder="Cauta dupa titlu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
        <input
          type="text"
          placeholder="Cauta dupa profesor..."
          value={teacherSearch}
          onChange={(e) => setTeacherSearch(e.target.value)}
          style={styles.searchInput}
        />
        <button type="submit" style={styles.searchButton}>
          Cauta
        </button>
        {(search || teacherSearch) && (
          <button
            type="button"
            style={styles.clearButton}
            onClick={() => {
              setSearch('')
              setTeacherSearch('')
              setPage(1)
              fetchCourses('', '', 1)
            }}
          >
            Sterge
          </button>
        )}
      </form>

      {loading ? (
        <p style={styles.loading}>Se incarca cursurile...</p>
      ) : error ? (
        <ErrorMessage message={error} onRetry={() => fetchCourses(search, teacherSearch, page)} />
      ) : courses.length === 0 ? (
        <div style={styles.empty}>
          <p>Nu au fost gasite cursuri</p>
        </div>
      ) : (
        <>
          <p style={styles.resultsInfo}>
            {pagination && `${pagination.total} cursuri gasite — pagina ${pagination.page} din ${pagination.pages}`}
          </p>
          <div style={styles.grid}>
            {courses.map(course => (
              <div key={course.id} style={styles.courseWrapper}>
                <CourseCard
                  course={course}
                  onClick={() => handleCardClick(course)}
                />
                <div style={styles.favoriteOverlay}>
                  <FavoriteButton
                    isFavorite={favoriteCourseIds.includes(course.id)}
                    onAdd={() => handleToggleFavorite(course)}
                    onRemove={() => handleToggleFavorite(course)}
                    size="small"
                  />
                </div>
              </div>
            ))}
          </div>

          {pagination && pagination.pages > 1 && (
            <div style={styles.pagination}>
              <button
                style={styles.pageButton}
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Anterior
              </button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  style={{
                    ...styles.pageButton,
                    ...(p === page ? styles.pageButtonActive : {})
                  }}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                style={styles.pageButton}
                disabled={page === pagination.pages}
                onClick={() => setPage(p => p + 1)}
              >
                Urmator
              </button>
            </div>
          )}
        </>
      )}

      {(selectedCourse || loadingDetail || errorDetail) && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <button style={styles.closeButton} onClick={closeModal}>X</button>

            {loadingDetail ? (
              <p style={styles.loading}>Se incarca detaliile...</p>
            ) : errorDetail ? (
              <ErrorMessage message={errorDetail} />
            ) : selectedCourse && (
              <>
                <div style={styles.modalHeader}>
                  <div style={styles.modalTitleRow}>
                    <h2 style={styles.modalTitle}>{selectedCourse.title}</h2>
                    <FavoriteButton
                      isFavorite={favoriteCourseIds.includes(selectedCourse.id)}
                      onAdd={() => handleToggleFavorite(selectedCourse)}
                      onRemove={() => handleToggleFavorite(selectedCourse)}
                    />
                  </div>
                  <p style={styles.modalTeacher}>{selectedCourse.teacher}</p>
                  {selectedCourse.description && (
                    <p style={styles.modalDescription}>{selectedCourse.description}</p>
                  )}
                  <div style={styles.modalStats}>
                    <span style={styles.modalStat}>
                      Maxim {selectedCourse.max_students} studenti
                    </span>
                    <span style={styles.modalStat}>
                      Inscrisi: {selectedCourse.enrolled_students || 0}
                    </span>
                    <span style={styles.modalStat}>
                      Locuri libere: {selectedCourse.available_spots || 0}
                    </span>
                  </div>
                </div>

                {courseAverage && (
                  <div style={styles.averageSection}>
                    <h3 style={styles.sectionTitle}>Media Notelor</h3>
                    <div style={styles.averageCard}>
                      {courseAverage.average_grade ? (
                        <>
                          <span style={{
                            ...styles.averageValue,
                            color: getAverageColor(courseAverage.average_grade)
                          }}>
                            {parseFloat(courseAverage.average_grade).toFixed(2)}
                          </span>
                          <div>
                            <p style={styles.averageLabel}>
                              din {courseAverage.total_graded} studenti notati
                            </p>
                            <p style={styles.averageLabel}>
                              Min: {courseAverage.min_grade} | Max: {courseAverage.max_grade}
                            </p>
                          </div>
                        </>
                      ) : (
                        <div>
                          <p style={styles.noAverage}>Nicio nota inregistrata inca</p>
                          <p style={styles.averageSubLabel}>
                            {courseAverage.total_enrolled} student(i) inscris(i)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div style={styles.newsSection}>
                  <h3 style={styles.sectionTitle}>
                    Stiri despre "{selectedCourse.title}"
                  </h3>
                  {courseNews.length === 0 ? (
                    <p style={styles.noNews}>Nu au fost gasite stiri relevante</p>
                  ) : (
                    <div style={styles.newsList}>
                      {courseNews.map((article, index) => (
                        <NewsCard key={index} article={article} />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
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
  searchForm: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap'
  },
  searchInput: {
    flex: 1,
    minWidth: '180px',
    padding: '0.7rem 1rem',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '0.95rem',
    outline: 'none'
  },
  searchButton: {
    padding: '0.7rem 1.5rem',
    backgroundColor: '#1a1a2e',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: 'bold'
  },
  clearButton: {
    padding: '0.7rem 1rem',
    backgroundColor: '#f8f9fa',
    color: '#666',
    border: '1px solid #ddd',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem'
  },
  resultsInfo: {
    color: '#888',
    fontSize: '0.85rem',
    marginBottom: '1rem'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem'
  },
  courseWrapper: {
    position: 'relative'
  },
  favoriteOverlay: {
    position: 'absolute',
    top: '0.8rem',
    right: '0.8rem',
    zIndex: 10
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
    marginTop: '1rem'
  },
  pageButton: {
    padding: '0.5rem 1rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer',
    backgroundColor: '#fff',
    fontSize: '0.9rem',
    color: '#333'
  },
  pageButtonActive: {
    backgroundColor: '#1a1a2e',
    color: '#fff',
    border: '1px solid #1a1a2e'
  },
  loading: {
    color: '#999',
    textAlign: 'center',
    padding: '2rem'
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    padding: '3rem',
    backgroundColor: '#fff',
    borderRadius: '12px'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem'
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '2rem',
    width: '100%',
    maxWidth: '640px',
    maxHeight: '85vh',
    overflowY: 'auto',
    position: 'relative'
  },
  closeButton: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: 'none',
    border: 'none',
    fontSize: '1.2rem',
    cursor: 'pointer',
    color: '#888'
  },
  modalHeader: {
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #eee'
  },
  modalTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '0.5rem',
    marginBottom: '0.4rem'
  },
  modalTitle: {
    fontSize: '1.4rem',
    fontWeight: 'bold',
    color: '#1a1a2e',
    flex: 1
  },
  modalTeacher: {
    fontSize: '0.95rem',
    color: '#555',
    marginBottom: '0.5rem'
  },
  modalDescription: {
    fontSize: '0.9rem',
    color: '#666',
    lineHeight: '1.5',
    marginBottom: '0.8rem'
  },
  modalStats: {
    display: 'flex',
    gap: '0.8rem',
    flexWrap: 'wrap'
  },
  modalStat: {
    fontSize: '0.82rem',
    color: '#fff',
    backgroundColor: '#1a1a2e',
    padding: '0.3rem 0.7rem',
    borderRadius: '20px'
  },
  averageSection: {
    marginBottom: '1.5rem'
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: '0.8rem'
  },
  averageCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    padding: '1rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  averageValue: {
    fontSize: '2.5rem',
    fontWeight: 'bold'
  },
  averageLabel: {
    fontSize: '0.85rem',
    color: '#888',
    marginBottom: '0.2rem'
  },
  averageSubLabel: {
    fontSize: '0.8rem',
    color: '#aaa',
    marginTop: '0.3rem'
  },
  noAverage: {
    color: '#888',
    fontStyle: 'italic',
    fontSize: '0.9rem'
  },
  newsSection: {
    marginTop: '0.5rem'
  },
  newsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.8rem'
  },
  noNews: {
    color: '#888',
    fontStyle: 'italic',
    fontSize: '0.9rem'
  }
}
