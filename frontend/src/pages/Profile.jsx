import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import API from "../api/api"
import { getStoredUser } from "../utils/auth"

import Starfield from "../components/Starfield"
import Navbar from "../components/Navbar"

function Profile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedAnalysis, setSelectedAnalysis] = useState(null)

  const storedUser = getStoredUser()

  useEffect(() => {
    if (!storedUser) {
      navigate("/login")
      return
    }

    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await API.get(`/profile/${storedUser.email}`)
        setProfile(response.data.profile)
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to load profile")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [storedUser?.email, navigate])

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    } catch {
      return dateString
    }
  }

  const handleViewAnalysis = async (dataset) => {
    setSelectedAnalysis(dataset)
  }

  const handleDownloadReport = async (dataset) => {
    try {
      // Create a simple text report from the stored analysis
      let reportText = `DATASET ANALYSIS REPORT\n`
      reportText += `${'='.repeat(50)}\n\n`
      reportText += `Dataset: ${dataset.filename}\n`
      reportText += `Analyzed: ${formatDate(dataset.analyzed_at)}\n\n`
      reportText += `DATASET METRICS\n`
      reportText += `${'-'.repeat(50)}\n`
      reportText += `Total Rows: ${dataset.rows.toLocaleString()}\n`
      reportText += `Total Columns: ${dataset.columns}\n`
      reportText += `Numeric Columns: ${dataset.numeric_column_count || 'N/A'}\n\n`
      
      if (dataset.column_types && Object.keys(dataset.column_types).length > 0) {
        reportText += `COLUMN INFORMATION\n`
        reportText += `${'-'.repeat(50)}\n`
        Object.entries(dataset.column_types).forEach(([col, type]) => {
          reportText += `${col}: ${type}\n`
        })
        reportText += `\n`
      }
      
      if (dataset.missing_values && Object.keys(dataset.missing_values).length > 0) {
        reportText += `MISSING VALUES\n`
        reportText += `${'-'.repeat(50)}\n`
        Object.entries(dataset.missing_values).forEach(([col, count]) => {
          if (count > 0) {
            reportText += `${col}: ${count} missing values\n`
          }
        })
        reportText += `\n`
      }
      
      if (dataset.statistics && Object.keys(dataset.statistics).length > 0) {
        reportText += `STATISTICAL SUMMARY\n`
        reportText += `${'-'.repeat(50)}\n`
        Object.entries(dataset.statistics).forEach(([col, stats]) => {
          reportText += `\n${col}:\n`
          Object.entries(stats).forEach(([key, value]) => {
            reportText += `  ${key}: ${typeof value === 'number' ? value.toFixed(2) : value}\n`
          })
        })
      }

      // Create and download the text file
      const element = document.createElement('a')
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(reportText))
      element.setAttribute('download', `${dataset.filename.replace(/\.[^/.]+$/, '')}_report.txt`)
      element.style.display = 'none'
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    } catch (err) {
      console.error('Error downloading report:', err)
      alert('Failed to download report')
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  }

  return (
    <>
      <Starfield />
      <Navbar />
      <div className="profile-page">
        <motion.div
          className="profile-wrapper"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div className="profile-header" variants={itemVariants}>
            <h1 className="profile-title">My Profile</h1>
            <p className="profile-subtitle">Account details and analysis activity</p>
          </motion.div>

          {/* Error State */}
          {error && (
            <motion.div className="error-container" variants={itemVariants}>
              <div className="error-icon">⚠️</div>
              <p>{error}</p>
            </motion.div>
          )}

          {/* Loading State */}
          {loading && (
            <motion.div
              className="loading-container"
              variants={itemVariants}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div className="loading-spinner" />
              <p>Loading your profile...</p>
            </motion.div>
          )}

          {/* Profile Content */}
          {!loading && !error && profile && (
            <>
              {/* User Card */}
              <motion.div className="user-card" variants={itemVariants}>
                <div className="user-card-content">
                  <motion.div
                    className="user-avatar"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <span>👤</span>
                  </motion.div>

                  <div className="user-info">
                    <h2 className="user-name">{profile.name}</h2>
                    <p className="user-email">{profile.email}</p>
                  </div>
                </div>

                <div className="stats-grid">
                  <motion.div
                    className="stat-box stat-box-1"
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <div className="stat-value">{profile.total_analyses}</div>
                    <div className="stat-label">Total Analyses</div>
                  </motion.div>

                  <motion.div
                    className="stat-box stat-box-2"
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <div className="stat-value">{profile.datasets_analyzed?.length || 0}</div>
                    <div className="stat-label">Datasets Analyzed</div>
                  </motion.div>

                  <motion.div
                    className="stat-box stat-box-3"
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <div className="stat-value">{formatDate(profile.created_at).split(",")[0]}</div>
                    <div className="stat-label">Member Since</div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Analysis History Section */}
              <motion.div className="history-section" variants={itemVariants}>
                <h3 className="history-title">📊 Analysis History</h3>

                {profile.datasets_analyzed && profile.datasets_analyzed.length > 0 ? (
                  <motion.div
                    className="datasets-container"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.08 }
                      }
                    }}
                    initial="hidden"
                    animate="visible"
                  >
                    {profile.datasets_analyzed.map((dataset, index) => (
                      <motion.div
                        key={index}
                        className="dataset-card"
                        variants={{
                          hidden: { opacity: 0, x: -20 },
                          visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
                        }}
                        whileHover={{
                          y: -8,
                          transition: { type: "spring", stiffness: 400 }
                        }}
                      >
                        <div className="dataset-header">
                          <div className="dataset-name-section">
                            <span className="dataset-icon">📁</span>
                            <div>
                              <h4 className="dataset-name">{dataset.filename}</h4>
                              <p className="dataset-date">{formatDate(dataset.analyzed_at)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="dataset-stats">
                          <motion.div
                            className="dataset-stat"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <span className="stat-icon">📈</span>
                            <div className="stat-info">
                              <p className="stat-text">{dataset.rows.toLocaleString()}</p>
                              <span className="stat-label-mini">Rows</span>
                            </div>
                          </motion.div>

                          <motion.div
                            className="dataset-stat"
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            <span className="stat-icon">🏛️</span>
                            <div className="stat-info">
                              <p className="stat-text">{dataset.columns}</p>
                              <span className="stat-label-mini">Columns</span>
                            </div>
                          </motion.div>
                        </div>

                        <div className="dataset-actions">
                          <motion.button
                            className="btn-view-analysis"
                            onClick={() => handleViewAnalysis(dataset)}
                            whileHover={{ scale: 1.05, backgroundColor: "rgba(100, 150, 255, 0.3)" }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            👁️ View Analysis
                          </motion.button>

                          <motion.button
                            className="btn-download-report"
                            onClick={() => handleDownloadReport(dataset)}
                            whileHover={{ scale: 1.05, backgroundColor: "rgba(150, 100, 255, 0.3)" }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            ⬇️ Download Report
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div className="empty-state" variants={itemVariants}>
                    <div className="empty-icon">📊</div>
                    <p className="empty-text">No datasets analyzed yet</p>
                    <p className="empty-subtext">Upload and analyze your first dataset on the Dashboard</p>
                  </motion.div>
                )}
              </motion.div>

              {/* Action Buttons */}
              <motion.div className="action-buttons" variants={itemVariants}>
                <motion.button
                  className="btn-primary-large"
                  onClick={() => navigate("/dashboard")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  📊 Go to Dashboard
                </motion.button>

                <motion.button
                  className="btn-secondary-large"
                  onClick={() => window.location.reload()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  🔄 Refresh Profile
                </motion.button>
              </motion.div>

              {/* Analysis Details Modal */}
              {selectedAnalysis && (
                <motion.div
                  className="analysis-modal-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedAnalysis(null)}
                >
                  <motion.div
                    className="analysis-modal"
                    initial={{ scale: 0.8, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.8, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="modal-header">
                      <h3>{selectedAnalysis.filename}</h3>
                      <motion.button
                        className="modal-close"
                        onClick={() => setSelectedAnalysis(null)}
                        whileHover={{ rotate: 90 }}
                      >
                        ✕
                      </motion.button>
                    </div>

                    <div className="modal-content">
                      <div className="modal-section">
                        <h4>Dataset Information</h4>
                        <p><strong>Rows:</strong> {selectedAnalysis.rows.toLocaleString()}</p>
                        <p><strong>Columns:</strong> {selectedAnalysis.columns}</p>
                        <p><strong>Numeric Columns:</strong> {selectedAnalysis.numeric_column_count || 'N/A'}</p>
                        <p><strong>Analyzed:</strong> {formatDate(selectedAnalysis.analyzed_at)}</p>
                      </div>

                      {selectedAnalysis.column_types && Object.keys(selectedAnalysis.column_types).length > 0 && (
                        <div className="modal-section">
                          <h4>Column Types</h4>
                          <div className="modal-list">
                            {Object.entries(selectedAnalysis.column_types).map(([col, type], idx) => (
                              <div key={idx} className="list-item">
                                <span className="col-name">{col}:</span>
                                <span className="col-type">{type}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedAnalysis.missing_values && Object.keys(selectedAnalysis.missing_values).length > 0 && (
                        <div className="modal-section">
                          <h4>Missing Values</h4>
                          <div className="modal-list">
                            {Object.entries(selectedAnalysis.missing_values)
                              .filter(([_, count]) => count > 0)
                              .map(([col, count], idx) => (
                                <div key={idx} className="list-item">
                                  <span className="col-name">{col}:</span>
                                  <span className="col-type">{count} missing</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {selectedAnalysis.statistics && Object.keys(selectedAnalysis.statistics).length > 0 && (
                        <div className="modal-section">
                          <h4>Statistical Summary</h4>
                          <div className="modal-stats">
                            {Object.entries(selectedAnalysis.statistics).slice(0, 5).map(([col, stats], idx) => (
                              <div key={idx} className="stat-group">
                                <h5>{col}</h5>
                                <div className="stat-items">
                                  {Object.entries(stats).slice(0, 4).map(([key, value], i) => (
                                    <p key={i}>
                                      <strong>{key}:</strong> {typeof value === 'number' ? value.toFixed(2) : value}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="modal-actions">
                        <motion.button
                          className="btn-modal-primary"
                          onClick={() => {
                            handleDownloadReport(selectedAnalysis)
                            setSelectedAnalysis(null)
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          ⬇️ Download Full Report
                        </motion.button>
                        <motion.button
                          className="btn-modal-secondary"
                          onClick={() => setSelectedAnalysis(null)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Close
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </>
  )
}

export default Profile
