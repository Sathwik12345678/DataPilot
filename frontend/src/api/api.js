import axios from "axios";

const appEnv = import.meta.env.MODE
const renderBackendUrl = "https://datapilot-0b2k.onrender.com"  // Replace with your Render backend URL

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (appEnv === "production" ? renderBackendUrl : "http://localhost:8000")

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

export default API;