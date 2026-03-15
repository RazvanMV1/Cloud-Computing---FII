import { useEffect, useState } from 'react'
import { getEducationNews, getNewsByTopic, getFavoriteArticles, addFavoriteArticle, removeFavoriteArticle } from '../services/api'
import NewsCard from '../components/NewsCard'
import ErrorMessage from '../components/ErrorMessage'
import FavoriteButton from '../components/FavoriteButton'
import { SkeletonNewsCard } from '../components/Skeleton'

export default function News() {
  const [articles, setArticles] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)

  const [topicSearch, setTopicSearch] = useState('')
  const [topicMode, setTopicMode] = useState(false)
  const [loadingTopic, setLoadingTopic] = useState(false)
  const [errorTopic, setErrorTopic] = useState(null)
  const [topicArticles, setTopicArticles] = useState([])
  const [currentTopic, setCurrentTopic] = useState('')

  const [favoriteUrls, setFavoriteUrls] = useState([])

  const fetchNews = async (currentPage = 1) => {
    setLoading(true)
    setError(null)
    try {
      const response = await getEducationNews({ page: currentPage, page_size: 6 })
      setArticles(response.data.articles || [])
      setPagination({
        total: response.data.total_results,
        page: response.data.page,
        page_size: response.data.page_size
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchNewsByTopic = async (topic) => {
    setLoadingTopic(true)
    setErrorTopic(null)
    setTopicArticles([])
    try {
      const response = await getNewsByTopic(topic, 9)
      setTopicArticles(response.data.articles || [])
      setCurrentTopic(response.data.topic)
      setTopicMode(true)
    } catch (err) {
      setErrorTopic(err.message)
    } finally {
      setLoadingTopic(false)
    }
  }

  const fetchFavorites = async () => {
    try {
      const response = await getFavoriteArticles()
      const urls = (response.data.data || []).map(a => a.url)
      setFavoriteUrls(urls)
    } catch (err) {
      console.error('Nu s-au putut incarca favoritele:', err)
    }
  }

  useEffect(() => {
    fetchNews(page)
    fetchFavorites()
  }, [page])

  const handleTopicSearch = (e) => {
    e.preventDefault()
    if (topicSearch.trim().length < 2) return
    fetchNewsByTopic(topicSearch.trim())
  }

  const handleBackToGeneral = () => {
    setTopicMode(false)
    setTopicSearch('')
    setCurrentTopic('')
    setTopicArticles([])
    setErrorTopic(null)
  }

  const handleToggleArticleFavorite = async (article) => {
    try {
      if (favoriteUrls.includes(article.url)) {
        await removeFavoriteArticle(article.url)
        setFavoriteUrls(prev => prev.filter(url => url !== article.url))
      } else {
        await addFavoriteArticle({
          url: article.url,
          title: article.title,
          description: article.description || '',
          source: article.source,
          published_at: article.published_at,
          image_url: article.image_url || null
        })
        setFavoriteUrls(prev => [...prev, article.url])
      }
    } catch (err) {
      console.error('Eroare la favorite:', err)
    }
  }

  const renderArticles = (articleList) => (
    <div style={styles.grid}>
      {articleList.map((article, index) => (
        <div key={index} style={styles.articleWrapper}>
          <NewsCard article={article} />
          <div style={styles.articleFavorite}>
            <FavoriteButton
              isFavorite={favoriteUrls.includes(article.url)}
              onAdd={() => handleToggleArticleFavorite(article)}
              onRemove={() => handleToggleArticleFavorite(article)}
              size="small"
            />
          </div>
        </div>
      ))}
    </div>
  )

  const topics = [
    'Artificial Intelligence',
    'Machine Learning',
    'Cloud Computing',
    'Cybersecurity',
    'Data Science',
    'Web Development'
  ]

  return (
    <div style={styles.page}>
      <h1 style={styles.pageTitle}>Stiri</h1>

      <div style={styles.searchSection}>
        <form onSubmit={handleTopicSearch} style={styles.searchForm}>
          <input
            type="text"
            placeholder="Cauta stiri dupa topic..."
            value={topicSearch}
            onChange={(e) => setTopicSearch(e.target.value)}
            style={styles.searchInput}
          />
          <button type="submit" style={styles.searchButton}>
            Cauta
          </button>
          {topicMode && (
            <button
              type="button"
              style={styles.backButton}
              onClick={handleBackToGeneral}
            >
              Inapoi la general
            </button>
          )}
        </form>

        <div style={styles.topicButtons}>
          <span style={styles.topicLabel}>Topicuri rapide:</span>
          {topics.map(topic => (
            <button
              key={topic}
              style={styles.topicButton}
              onClick={() => {
                setTopicSearch(topic)
                fetchNewsByTopic(topic)
              }}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {topicMode && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            Rezultate pentru "{currentTopic}"
          </h2>
          {loadingTopic ? (
            <div style={styles.grid}>
              <SkeletonNewsCard />
              <SkeletonNewsCard />
              <SkeletonNewsCard />
            </div>
          ) : errorTopic ? (
            <ErrorMessage
              message={errorTopic}
              onRetry={() => fetchNewsByTopic(currentTopic)}
            />
          ) : topicArticles.length === 0 ? (
            <div style={styles.empty}>
              <p>Nu au fost gasite stiri pentru acest topic</p>
            </div>
          ) : (
            renderArticles(topicArticles)
          )}
        </div>
      )}

      {!topicMode && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Stiri Generale despre Educatie</h2>
          {loading ? (
            <div style={styles.grid}>
              <SkeletonNewsCard />
              <SkeletonNewsCard />
              <SkeletonNewsCard />
              <SkeletonNewsCard />
              <SkeletonNewsCard />
              <SkeletonNewsCard />
            </div>
          ) : error ? (
            <ErrorMessage message={error} onRetry={() => fetchNews(page)} />
          ) : articles.length === 0 ? (
            <div style={styles.empty}>
              <p>Nu au fost gasite stiri</p>
            </div>
          ) : (
            <>
              {renderArticles(articles)}
              <div style={styles.pagination}>
                <button
                  style={{
                    ...styles.pageButton,
                    ...(page === 1 ? styles.pageButtonDisabled : {})
                  }}
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Anterior
                </button>
                <span style={styles.pageInfo}>Pagina {page}</span>
                <button
                  style={styles.pageButton}
                  onClick={() => setPage(p => p + 1)}
                >
                  Urmator
                </button>
              </div>
            </>
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
  searchSection: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    marginBottom: '2rem'
  },
  searchForm: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1rem',
    flexWrap: 'wrap'
  },
  searchInput: {
    flex: 1,
    minWidth: '200px',
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
  backButton: {
    padding: '0.7rem 1rem',
    backgroundColor: '#f8f9fa',
    color: '#666',
    border: '1px solid #ddd',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem'
  },
  topicButtons: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  topicLabel: {
    fontSize: '0.85rem',
    color: '#888',
    marginRight: '0.3rem'
  },
  topicButton: {
    padding: '0.4rem 0.9rem',
    backgroundColor: '#f0f2f5',
    color: '#1a1a2e',
    border: '1px solid #ddd',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '0.82rem',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  section: {
    marginBottom: '2rem'
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: '1rem'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem'
  },
  articleWrapper: {
    position: 'relative'
  },
  articleFavorite: {
    position: 'absolute',
    top: '0.8rem',
    right: '0.8rem',
    zIndex: 10
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '1rem'
  },
  pageButton: {
    padding: '0.5rem 1.2rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer',
    backgroundColor: '#fff',
    fontSize: '0.9rem',
    color: '#333'
  },
  pageButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  pageInfo: {
    fontSize: '0.9rem',
    color: '#888'
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
  }
}
