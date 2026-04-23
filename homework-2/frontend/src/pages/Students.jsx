import { useEffect, useState } from 'react'
import { getStudents, getStudentById, getStudentCourses, uploadDocument, getStudentDocuments, deleteDocument } from '../services/api'
import StudentCard from '../components/StudentCard'
import ErrorMessage from '../components/ErrorMessage'

export default function Students() {
  const [students, setStudents] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const [selectedStudent, setSelectedStudent] = useState(null)
  const [studentCourses, setStudentCourses] = useState([])
  const [studentDocs, setStudentDocs] = useState([])
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [errorDetail, setErrorDetail] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState(null)

  const fetchStudents = async (searchName = '', currentPage = 1) => {
    setLoading(true)
    setError(null)
    try {
      const params = { page: currentPage, limit: 9 }
      if (searchName) params.name = searchName
      const response = await getStudents(params)
      setStudents(response.data.data || [])
      setPagination(response.data.pagination || null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchStudentDetail = async (studentId) => {
    setLoadingDetail(true)
    setErrorDetail(null)
    setStudentCourses([])
    setStudentDocs([])
    setUploadMsg(null)
    try {
      const [studentRes, coursesRes, docsRes] = await Promise.all([
        getStudentById(studentId),
        getStudentCourses(studentId),
        getStudentDocuments(studentId)
      ])
      setSelectedStudent(studentRes.data.data || studentRes.data)
      const coursesData = coursesRes.data.data?.courses || coursesRes.data.courses || []
      setStudentCourses(Array.isArray(coursesData) ? coursesData : [])
      setStudentDocs(docsRes.data.data || [])
    } catch (err) {
      setErrorDetail(err.message)
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file || !selectedStudent) return
    setUploading(true)
    setUploadMsg(null)
    try {
      await uploadDocument(selectedStudent.id, file)
      setUploadMsg('Document uploadat cu succes!')
      const docsRes = await getStudentDocuments(selectedStudent.id)
      setStudentDocs(docsRes.data.data || [])
    } catch (err) {
      setUploadMsg('Eroare la upload: ' + (err.message || 'necunoscuta'))
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDeleteDoc = async (filename) => {
    if (!selectedStudent) return
    try {
      await deleteDocument(selectedStudent.id, filename)
      setStudentDocs(prev => prev.filter(d => d.filename !== filename))
    } catch (err) {
      alert('Eroare la stergerea documentului')
    }
  }

  useEffect(() => {
    fetchStudents(search, page)
  }, [page])

  const handleSearch = () => {
    setPage(1)
    fetchStudents(search, 1)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleCardClick = (student) => {
    fetchStudentDetail(student.id)
  }

  const closeModal = () => {
    setSelectedStudent(null)
    setStudentCourses([])
    setStudentDocs([])
    setErrorDetail(null)
    setUploadMsg(null)
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.pageTitle}>Studenti</h1>

      <div style={styles.searchForm}>
        <input
          type="text"
          placeholder="Cauta dupa nume..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          style={styles.searchInput}
        />
        <button
          type="button"
          style={styles.searchButton}
          onClick={handleSearch}
        >
          Cauta
        </button>
        {search && (
          <button
            type="button"
            style={styles.clearButton}
            onClick={() => { setSearch(''); setPage(1); fetchStudents('', 1) }}
          >
            Sterge
          </button>
        )}
      </div>

      {loading ? (
        <p style={styles.loading}>Se incarca studentii...</p>
      ) : error ? (
        <ErrorMessage message={error} onRetry={() => fetchStudents(search, page)} />
      ) : students.length === 0 ? (
        <div style={styles.empty}>
          <p>Nu au fost gasiti studenti</p>
        </div>
      ) : (
        <>
          <p style={styles.resultsInfo}>
            {pagination && `${pagination.total} studenti gasiti - pagina ${pagination.page} din ${pagination.pages}`}
          </p>
          <div style={styles.grid}>
            {students.map(student => (
              <StudentCard
                key={student.id}
                student={student}
                onClick={() => handleCardClick(student)}
              />
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

      {(selectedStudent || loadingDetail || errorDetail) && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <button style={styles.closeButton} onClick={closeModal}>X</button>

            {loadingDetail ? (
              <p style={styles.loading}>Se incarca detaliile...</p>
            ) : errorDetail ? (
              <ErrorMessage message={errorDetail} />
            ) : selectedStudent && (
              <>
                <div style={styles.modalHeader}>
                  <div style={styles.modalAvatar}>
                    {selectedStudent.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 style={styles.modalName}>{selectedStudent.name}</h2>
                    <p style={styles.modalEmail}>{selectedStudent.email}</p>
                    <p style={styles.modalAge}>{selectedStudent.age} ani</p>
                  </div>
                </div>

                <h3 style={styles.coursesTitle}>
                  Cursuri inscrise ({studentCourses.length})
                </h3>
                {studentCourses.length === 0 ? (
                  <p style={styles.noCourses}>Nu este inscris la niciun curs</p>
                ) : (
                  <div style={styles.coursesList}>
                    {studentCourses.map(course => (
                      <div key={course.enrollment_id} style={styles.courseItem}>
                        <div style={{ flex: 1 }}>
                          <p style={styles.courseItemTitle}>{course.title}</p>
                          <p style={styles.courseItemTeacher}>{course.teacher}</p>
                        </div>
                        <div style={styles.badgeContainer}>
                          {course.grade && (
                            <span style={{
                              ...styles.gradeBadge,
                              backgroundColor: course.grade >= 5 ? '#28a745' : '#dc3545'
                            }}>
                              Nota: {course.grade}
                            </span>
                          )}
                          {course.enrollment_status && (
                            <span style={{
                              ...styles.statusBadge,
                              backgroundColor:
                                course.enrollment_status === 'completed' ? '#28a745' :
                                course.enrollment_status === 'enrolled' ? '#4361ee' : '#dc3545'
                            }}>
                              {course.enrollment_status}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={styles.docsSection}>
                  <h3 style={styles.coursesTitle}>
                    Documente ({studentDocs.length})
                  </h3>
                  <p style={styles.docsSubtitle}>Stocat in Azure Blob Storage</p>

                  <div style={styles.uploadArea}>
                    <label style={styles.uploadLabel}>
                      {uploading ? 'Se uploadeaza...' : 'Incarca document'}
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        style={{ display: 'none' }}
                      />
                    </label>
                    {uploadMsg && (
                      <span style={{
                        ...styles.uploadMsg,
                        color: uploadMsg.includes('succes') ? '#28a745' : '#dc3545'
                      }}>
                        {uploadMsg}
                      </span>
                    )}
                  </div>

                  {studentDocs.length === 0 ? (
                    <p style={styles.noCourses}>Niciun document uploadat</p>
                  ) : (
                    <div style={styles.docsList}>
                      {studentDocs.map((doc, index) => (
                        <div key={index} style={styles.docItem}>
                          <div style={{ flex: 1 }}>
                            <p style={styles.docName}>{doc.filename}</p>
                            <p style={styles.docMeta}>{formatSize(doc.size)}</p>
                          </div>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={styles.docLink}
                          >
                            Descarca
                          </a>
                          <button
                            style={styles.docDelete}
                            onClick={() => handleDeleteDoc(doc.filename)}
                          >
                            X
                          </button>
                        </div>
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
    maxWidth: '560px',
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
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  modalAvatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#1a1a2e',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.8rem',
    fontWeight: 'bold',
    flexShrink: 0
  },
  modalName: {
    fontSize: '1.3rem',
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: '0.3rem'
  },
  modalEmail: {
    fontSize: '0.9rem',
    color: '#666',
    marginBottom: '0.2rem'
  },
  modalAge: {
    fontSize: '0.9rem',
    color: '#666'
  },
  coursesTitle: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: '0.8rem'
  },
  noCourses: {
    color: '#888',
    fontSize: '0.9rem',
    fontStyle: 'italic'
  },
  coursesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  courseItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    padding: '0.8rem 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.5rem'
  },
  courseItemTitle: {
    fontWeight: 'bold',
    fontSize: '0.9rem',
    color: '#1a1a2e',
    marginBottom: '0.2rem'
  },
  courseItemTeacher: {
    fontSize: '0.8rem',
    color: '#666'
  },
  badgeContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem',
    alignItems: 'flex-end'
  },
  gradeBadge: {
    color: '#fff',
    fontSize: '0.8rem',
    padding: '0.2rem 0.6rem',
    borderRadius: '20px',
    fontWeight: 'bold',
    whiteSpace: 'nowrap'
  },
  statusBadge: {
    color: '#fff',
    fontSize: '0.8rem',
    padding: '0.2rem 0.6rem',
    borderRadius: '20px',
    fontWeight: 'bold',
    whiteSpace: 'nowrap'
  },
  docsSection: {
    marginTop: '1.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid #eee'
  },
  docsSubtitle: {
    fontSize: '0.75rem',
    color: '#0078d4',
    marginBottom: '0.8rem',
    marginTop: '-0.5rem'
  },
  uploadArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
    marginBottom: '0.8rem'
  },
  uploadLabel: {
    padding: '0.5rem 1rem',
    backgroundColor: '#0078d4',
    color: '#fff',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 'bold'
  },
  uploadMsg: {
    fontSize: '0.82rem'
  },
  docsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem'
  },
  docItem: {
    backgroundColor: '#f0f6ff',
    borderRadius: '8px',
    padding: '0.6rem 1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  docName: {
    fontSize: '0.85rem',
    fontWeight: 'bold',
    color: '#1a1a2e'
  },
  docMeta: {
    fontSize: '0.75rem',
    color: '#888'
  },
  docLink: {
    fontSize: '0.8rem',
    color: '#0078d4',
    fontWeight: 'bold'
  },
  docDelete: {
    background: 'none',
    border: 'none',
    color: '#dc3545',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 'bold'
  }
}