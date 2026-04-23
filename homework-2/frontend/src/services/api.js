import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      const message = error.response.data?.detail || 'Eroare server'
      return Promise.reject({ status: error.response.status, message })
    } else if (error.request) {
      return Promise.reject({ status: 503, message: 'Serverul nu este accesibil' })
    } else {
      return Promise.reject({ status: 500, message: error.message })
    }
  }
)

// University
export const getStudents = (params) => api.get('/university/students', { params })
export const getStudentById = (id) => api.get(`/university/students/${id}`)
export const getStudentCourses = (id) => api.get(`/university/students/${id}/courses`)
export const getCourses = (params) => api.get('/university/courses', { params })
export const getCourseById = (id) => api.get(`/university/courses/${id}`)
export const getCourseAverage = (id) => api.get(`/university/courses/${id}/average`)
export const getEnrollments = (params) => api.get('/university/enrollments', { params })

// Weather
export const getCurrentWeather = () => api.get('/weather/current')
export const getForecast = () => api.get('/weather/forecast')

// News
export const getEducationNews = (params) => api.get('/news/education', { params })
export const getNewsByTopic = (topic, page_size) =>
  api.get('/news/topic', { params: { topic, page_size } })

// Stats
export const getEnrollmentsByStatus = () => api.get('/university/stats/enrollments-by-status')
export const getStudentsPerCourse = () => api.get('/university/stats/students-per-course')
export const getWeatherForecast = () => api.get('/weather/forecast')

// Favorites (Azure Cosmos DB)
export const getFavoriteCourses = () => api.get('/favorites/courses')
export const addFavoriteCourse = (course) => api.post('/favorites/courses', course)
export const removeFavoriteCourse = (id) => api.delete(`/favorites/courses/${id}`)

export const getFavoriteArticles = () => api.get('/favorites/articles')
export const addFavoriteArticle = (article) => api.post('/favorites/articles', article)
export const removeFavoriteArticle = (url) => api.delete('/favorites/articles', { data: { url } })

// Documents (Azure Blob Storage)
export const uploadDocument = (studentId, file) => {
  const formData = new FormData()
  formData.append('student_id', studentId)
  formData.append('file', file)
  return api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
export const getStudentDocuments = (studentId) => api.get(`/documents/${studentId}`)
export const deleteDocument = (studentId, filename) => api.delete(`/documents/${studentId}/${filename}`)

// Events (Azure Queue Storage)
export const getRecentEvents = () => api.get('/events/recent')

// Translator (Azure Cognitive Services)
export const translateText = (text, to = 'ro') =>
  api.get('/translate/', { params: { text, to } })

// Activity Log (Azure Table Storage)
export const getActivityLog = (date, top = 20) =>
  api.get('/activity/log', { params: { date, top } })

export default api