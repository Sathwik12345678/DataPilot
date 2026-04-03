import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import API from "../api/api"
import { motion as Motion } from "framer-motion"
import html2canvas from "html2canvas"
import { getStoredUser } from "../utils/auth"

import Starfield from "../components/Starfield"
import Navbar from "../components/Navbar"
import Charts from "../components/Charts"

// Optimization: Memoize chart image generation to avoid reprocessing
const compressImage = (dataUrl, quality = 0.8) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      // For PDF: maintain quality by using higher resolution
      canvas.width = img.width * 0.75  // Reduce resolution by 25% (better than 50%)
      canvas.height = img.height * 0.75
      const ctx = canvas.getContext("2d")
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      // Use higher quality for PDF
      resolve(canvas.toDataURL("image/jpeg", quality))
    }
    img.src = dataUrl
  })
}

function Dashboard(){
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [result, setResult] = useState(null)
  const [selectedColumn, setSelectedColumn] = useState("")
  const [error, setError] = useState(null)
  const [chartsReady, setChartsReady] = useState(false)

  const resultRef = useRef(null)
  const chartsContainerRef = useRef(null)
  const uploadAbortController = useRef(null)

  // Auto scroll to results
  useEffect(() => {
    if (result && resultRef.current) {
      setTimeout(() => {
        resultRef.current.scrollIntoView({ behavior: "smooth" })
      }, 300)
    }
  }, [result])

  // Mark charts as ready for rendering
  useEffect(() => {
    if (result) {
      setChartsReady(true)
    }
  }, [result])

  // File handling functions
  const handleFile = useCallback((e) => {
    const uploadedFile = e.target.files?.[0]
    if (uploadedFile) {
      setFile(uploadedFile)
      setResult(null)
      setSelectedColumn("")
      setError(null)
      setChartsReady(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile && (droppedFile.name.endsWith(".csv") || droppedFile.name.endsWith(".xlsx"))) {
      setFile(droppedFile)
      setResult(null)
      setSelectedColumn("")
      setError(null)
      setChartsReady(false)
    } else {
      setError("Please upload a CSV or Excel file")
    }
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.currentTarget.style.backgroundColor = "rgba(100, 150, 255, 0.1)"
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.currentTarget.style.backgroundColor = "transparent"
  }, [])

  // Upload dataset with optimization
  const handleUpload = useCallback(async () => {
    if (!file) {
      setError("Please upload a file")
      return
    }

    // Cancel previous request if still in progress
    uploadAbortController.current?.abort()
    uploadAbortController.current = new AbortController()

    const formData = new FormData()
    formData.append("file", file)

    try {
      setLoading(true)
      setError(null)

      const user = getStoredUser()
      const userEmail = user?.email ? `?user_email=${encodeURIComponent(user.email)}` : ""

      const response = await API.post(
        `/upload-dataset${userEmail}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          signal: uploadAbortController.current.signal,
          timeout: 60000  // 60 second timeout
        }
      )

      setResult(response.data)
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.response?.data?.detail || "Upload failed. Please try again.")
        console.error("Upload error:", err)
      }
    } finally {
      setLoading(false)
    }
  }, [file])

  // Optimized PDF download - REUSES uploaded file
  const handleDownload = useCallback(async () => {
    if (!file) {
      setError("Upload file first")
      return
    }

    if (!result) {
      setError("Analyze dataset first")
      return
    }

    const formData = new FormData()
    formData.append("file", file)  // REUSE stored file

    try {
      setDownloading(true)
      setError(null)

      // Generate high-quality chart image for PDF
      const chartArea = chartsContainerRef.current
      if (chartArea) {
        try {
          const canvas = await html2canvas(chartArea, {
            scale: 2,  // Higher resolution for PDF (2x)
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            logging: false,
            windowHeight: chartArea.scrollHeight,
            windowWidth: chartArea.scrollWidth
          })
          const chartImage = canvas.toDataURL("image/png")
          
          // Compress image optimized for PDF (higher quality)
          const compressedImage = await compressImage(chartImage, 0.8)
          formData.append("chart_image", compressedImage)
        } catch (imgErr) {
          console.warn("Chart image generation failed, continuing without image:", imgErr)
        }
      }

      const response = await API.post(
        "/download-report",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          responseType: "blob",
          timeout: 60000
        }
      )

      // Trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", "DataPilot_Report.pdf")
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

    } catch (err) {
      setError(err.response?.data?.detail || "Download failed. Please try again.")
      console.error("Download error:", err)
    } finally {
      setDownloading(false)
    }
  }, [file, result])

  // Text effect
  const splitText = useCallback((text) => {
    return text.split("").map((char, index) => (
      <span key={index}>{char}</span>
    ))
  }, [])

  // Memoized insights generation
  const insights = useMemo(() => {
    if (!result) return []

    let insights = []

    // Executive Summary
    const dataMsg = result.is_sampled
      ? `${result.rows} sampled observations (${result.sample_percentage}% of ${result.original_rows} total)`
      : `${result.rows} observations`
    
    insights.push(`The dataset contains ${dataMsg} across ${result.columns.length} variables, providing a structured basis for analytical evaluation.`)

    // Feature Analysis
    Object.entries(result.statistics || {}).forEach(([col, stats]) => {
      if (!stats.mean) return
      
      const range = stats.max - stats.min
      insights.push(
        `${col} has an average value of ${stats.mean.toFixed(2)}, with values ranging between ${stats.min} and ${stats.max}.`
      )

      if (range > stats.mean) {
        insights.push(
          `The variation in ${col} is relatively high, indicating diverse data distribution across records.`
        )
      }

      if (range < stats.mean * 0.3) {
        insights.push(
          `${col} demonstrates consistent values with minimal variation.`
        )
      }
    })

    // Anomaly Detection
    Object.entries(result.statistics || {}).forEach(([col, stats]) => {
      if (stats.max > stats.mean * 2) {
        insights.push(
          `${col} contains significantly high values compared to its average, suggesting the presence of outliers.`
        )
      }
    })

    // Data Quality
    Object.entries(result.missing_values || {}).forEach(([col, val]) => {
      if (val > 0) {
        insights.push(
          `${col} includes ${val} missing values, which may impact analytical accuracy if not handled.`
        )
      }
    })

    // Top Values
    Object.entries(result.top_values || {}).forEach(([col, values]) => {
      if (values.length > 0) {
        insights.push(
          `The highest observed values for ${col} are ${values.join(", ")}, representing peak data points.`
        )
      }
    })

    // Final Interpretation
    insights.push(
      "The dataset shows a combination of stable and variable features, making it suitable for further statistical modeling and predictive analysis."
    )

    return insights
  }, [result])

  return (
    <>
      <Starfield />
      <Navbar />

      <div className="dashboard-container">
        <h1 className="zoom-text">
          {splitText("Dashboard")}
        </h1>

        <p className="dashboard-subtitle zoom-text">
          {splitText("Upload a dataset to generate insights")}
        </p>

        {error && (
          <div style={{
            padding: "15px",
            marginBottom: "20px",
            backgroundColor: "rgba(255, 100, 100, 0.2)",
            border: "1px solid rgba(255, 100, 100, 0.5)",
            borderRadius: "8px",
            color: "#ff6464"
          }}>
            {error}
          </div>
        )}

        <div
          className="upload-card"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            type="file"
            id="fileUpload"
            onChange={handleFile}
            accept=".csv,.xlsx,.xls"
            hidden
          />

          <label htmlFor="fileUpload" className="upload-area">
            <p className="upload-icon">📊</p>
            <p className="upload-text">Drag & Drop Dataset</p>
            <p className="upload-subtext">CSV / Excel supported</p>
          </label>

          {file && <p className="file-name">📁 {file.name}</p>}

          <button
            className="btn-primary"
            onClick={handleUpload}
            disabled={loading || !file}
          >
            {loading ? "⏳ Analyzing..." : "Analyze Dataset"}
          </button>

          <button
            className="btn-secondary"
            onClick={handleDownload}
            disabled={!file || !result || downloading}
          >
            {downloading ? "⏳ Generating..." : "📥 Download Report"}
          </button>
        </div>

        {loading && (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <p className="loading-text">
              🔄 Analyzing dataset... Please wait
            </p>
            <div style={{
              height: "4px",
              backgroundColor: "rgba(100, 150, 255, 0.2)",
              borderRadius: "2px",
              marginTop: "10px",
              animation: "pulse 1.5s infinite"
            }}></div>
          </div>
        )}

        {result && !loading && (
          <div className="dashboard-content" ref={resultRef}>
            {result.is_sampled && (
              <div style={{
                padding: "10px 15px",
                marginBottom: "20px",
                backgroundColor: "rgba(255, 193, 7, 0.1)",
                border: "1px solid rgba(255, 193, 7, 0.3)",
                borderRadius: "6px",
                color: "#ffc107",
                fontSize: "14px"
              }}>
                ℹ️ Large dataset detected - showing {result.sample_percentage}% sample for performance. Full dataset analysis available on request.
              </div>
            )}

            <Motion.div
              className="kpi-grid"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="kpi-card">
                <p>Rows</p>
                <h2>{result.rows}</h2>
              </div>

              <div className="kpi-card">
                <p>Columns</p>
                <h2>{result.columns.length}</h2>
              </div>

              <div className="kpi-card">
                <p>Numeric</p>
                <h2>{result.statistics ? Object.keys(result.statistics).length : 0}</h2>
              </div>
            </Motion.div>

            <Motion.div
              className="stats-grid"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {result.statistics && Object.entries(result.statistics).map(([col, stats]) => (
                <div key={col} className="stat-card">
                  <h3>{col}</h3>
                  <p>Mean: {stats.mean ? stats.mean.toFixed(2) : "N/A"}</p>
                  <p>Min: {stats.min}</p>
                  <p>Max: {stats.max}</p>
                </div>
              ))}
            </Motion.div>

            <Motion.div
              className="insights-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h2>📊 AI Insights</h2>
              {insights.slice(0, 8).map((text, index) => (
                <p key={index}>• {text}</p>
              ))}
            </Motion.div>

            <div style={{ marginTop: "30px", textAlign: "center" }}>
              <select
                value={selectedColumn}
                onChange={(e) => setSelectedColumn(e.target.value)}
                className="filter-dropdown"
              >
                <option value="">All Columns</option>
                {result.statistics && Object.keys(result.statistics).map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>

            {chartsReady && (
              <>
                <Motion.div
                  className="charts-wrapper"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  ref={chartsContainerRef}
                >
                  <h2 className="chart-title">📈 Visual Analytics</h2>
                  <Charts data={result} selectedColumn={selectedColumn} showPieChart={false} />
                </Motion.div>

                {/* PIE CHART - SEPARATE SECTION AT END */}
                {result.pie_chart_data && result.pie_chart_data.length > 0 && (
                  <Motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    style={{
                      marginTop: "50px",
                      paddingTop: "30px",
                      borderTop: "2px solid #444",
                      backgroundColor: "rgba(0, 0, 0, 0.2)",
                      padding: "30px",
                      borderRadius: "12px"
                    }}
                  >
                    <h2 className="chart-title">🥧 Top Values Distribution Breakdown</h2>
                    <p style={{ textAlign: "center", color: "#aaa", marginBottom: "20px", fontSize: "14px" }}>
                      Detailed breakdown showing the highest values across your numeric columns
                    </p>
                    <Charts data={result} selectedColumn={selectedColumn} showPieChart={true} />
                  </Motion.div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default Dashboard