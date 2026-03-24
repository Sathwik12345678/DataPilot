import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { motion as Motion } from "framer-motion"
import html2canvas from "html2canvas"

import Starfield from "../components/Starfield"
import Navbar from "../components/Navbar"
import Charts from "../components/Charts"

function Dashboard(){

const [file,setFile] = useState(null)
const [loading,setLoading] = useState(false)
const [result,setResult] = useState(null)
const [selectedColumn, setSelectedColumn] = useState("")

const resultRef = useRef(null)

/* ===============================
   FILE HANDLING
=============================== */
function handleFile(e){
setFile(e.target.files[0])
setResult(null)
setSelectedColumn("")
}

function handleDrop(e){
e.preventDefault()
setFile(e.dataTransfer.files[0])
setResult(null)
setSelectedColumn("")
}

function handleDragOver(e){
e.preventDefault()
}

/* ===============================
   AUTO SCROLL
=============================== */
useEffect(()=>{
if(result && resultRef.current){
resultRef.current.scrollIntoView({ behavior:"smooth" })
}
},[result])

/* ===============================
   UPLOAD DATASET
=============================== */
async function handleUpload(){

if(!file){
alert("Please upload a file")
return
}

const formData = new FormData()
formData.append("file", file)

try{
setLoading(true)

const response = await axios.post(
"http://127.0.0.1:8000/upload-dataset",
formData
)

setResult(response.data)

}catch(err){
console.error(err)
alert("Upload failed")
}
finally{
setLoading(false)
}
}

/* ===============================
   DOWNLOAD PDF WITH CHART
=============================== */
async function handleDownload(){

if(!file){
alert("Upload file first")
return
}

const formData = new FormData()
formData.append("file", file)

try{

const chartArea = document.querySelector(".charts-container")

if(chartArea){
const canvas = await html2canvas(chartArea)
const chartImage = canvas.toDataURL("image/png")
formData.append("chart_image", chartImage)
}

const response = await axios.post(
"http://127.0.0.1:8000/download-report",
formData,
{ responseType:"blob" }
)

const url = window.URL.createObjectURL(new Blob([response.data]))
const link = document.createElement("a")
link.href = url
link.setAttribute("download","DataPilot_Report.pdf")
document.body.appendChild(link)
link.click()

}catch(err){
console.error(err)
alert("Download failed")
}
}

/* ===============================
   TEXT EFFECT
=============================== */
function splitText(text){
return text.split("").map((char,index)=>(
<span key={index}>{char}</span>
))
}

/* ===============================
   🔥 PROFESSIONAL AI INSIGHTS
=============================== */
function generateInsights(result){

let insights = []

// Executive Summary
insights.push(`The dataset contains ${result.rows} observations across ${result.columns.length} variables, providing a structured basis for analytical evaluation.`)

// Feature Analysis
Object.entries(result.statistics).forEach(([col, stats]) => {

const range = stats.max - stats.min

insights.push(
`${col} has an average value of ${stats.mean.toFixed(2)}, with values ranging between ${stats.min} and ${stats.max}.`
)

if(range > stats.mean){
insights.push(
`The variation in ${col} is relatively high, indicating diverse data distribution across records.`
)
}

if(range < stats.mean * 0.3){
insights.push(
`${col} demonstrates consistent values with minimal variation.`
)
}

})

// Anomaly Detection
Object.entries(result.statistics).forEach(([col, stats]) => {
if(stats.max > stats.mean * 2){
insights.push(
`${col} contains significantly high values compared to its average, suggesting the presence of outliers.`
)
}
})

// Data Quality
Object.entries(result.missing_values || {}).forEach(([col,val])=>{
if(val > 0){
insights.push(
`${col} includes ${val} missing values, which may impact analytical accuracy if not handled.`
)
}
})

// Top Values
Object.entries(result.top_values).forEach(([col, values])=>{
insights.push(
`The highest observed values for ${col} are ${values.join(", ")}, representing peak data points.`
)
})

// Final Interpretation
insights.push(
"The dataset shows a combination of stable and variable features, making it suitable for further statistical modeling and predictive analysis."
)

return insights
}

return(

<>
<Starfield/>
<Navbar/>

<div className="dashboard-container">

<h1 className="zoom-text">
{splitText("Dashboard")}
</h1>

<p className="dashboard-subtitle zoom-text">
{splitText("Upload a dataset to generate insights")}
</p>

<div 
className="upload-card"
onDrop={handleDrop}
onDragOver={handleDragOver}
>

<input 
type="file"
id="fileUpload"
onChange={handleFile}
hidden
/>

<label htmlFor="fileUpload" className="upload-area">
<p className="upload-icon">📊</p>
<p className="upload-text">Drag & Drop Dataset</p>
<p className="upload-subtext">CSV / Excel supported</p>
</label>

{file && <p className="file-name">{file.name}</p>}

<button 
className="btn-primary"
onClick={handleUpload}
disabled={loading}
>
{loading ? "Analyzing..." : "Analyze Dataset"}
</button>

<button 
className="btn-secondary"
onClick={handleDownload}
disabled={!file}
>
Download Report
</button>

</div>

{loading && (
<p className="loading-text">
Analyzing dataset... ⏳
</p>
)}

{result && !loading && (
<div className="dashboard-content" ref={resultRef}>

<Motion.div
className="kpi-grid"
initial={{opacity:0,y:40}}
animate={{opacity:1,y:0}}
transition={{duration:0.5}}
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
<h2>{Object.keys(result.statistics).length}</h2>
</div>

</Motion.div>

<Motion.div
className="stats-grid"
initial={{opacity:0,y:40}}
animate={{opacity:1,y:0}}
transition={{delay:0.2}}
>
{Object.entries(result.statistics).map(([col, stats]) => (
<div key={col} className="stat-card">
<h3>{col}</h3>
<p>Mean: {stats.mean.toFixed(2)}</p>
<p>Min: {stats.min}</p>
<p>Max: {stats.max}</p>
</div>
))}
</Motion.div>

<Motion.div
className="insights-card"
initial={{opacity:0,scale:0.95}}
animate={{opacity:1,scale:1}}
transition={{delay:0.3}}
>
<h2>AI Insights</h2>
{generateInsights(result).map((text, index) => (
<p key={index}>• {text}</p>
))}
</Motion.div>

<div style={{marginTop:"30px", textAlign:"center"}}>
<select
value={selectedColumn}
onChange={(e)=>setSelectedColumn(e.target.value)}
className="filter-dropdown"
>
<option value="">All Columns</option>
{Object.keys(result.statistics).map(col=>(
<option key={col} value={col}>{col}</option>
))}
</select>
</div>

<Motion.div
className="charts-wrapper"
initial={{opacity:0}}
animate={{opacity:1}}
transition={{delay:0.4}}
>
<h2 className="chart-title">Visual Analytics</h2>
<Charts data={result} selectedColumn={selectedColumn} />
</Motion.div>

</div>
)}

</div>

</>

)

}

export default Dashboard