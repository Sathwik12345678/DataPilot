import axios from "axios";

// Determine the API base URL based on environment
const getBaseURL = () => {
  // If VITE_API_BASE_URL is set in environment variables, use it
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Development environment
  if (import.meta.env.MODE === "development") {
    return "http://localhost:8000";
  }
  
  // Production fallback (Render backend)
  return "https://datapilot-backend.onrender.com";
};

const API = axios.create({
  baseURL: getBaseURL(),
});

// Add request interceptor for debugging (optional)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 0 || error.message === "Network Error") {
      console.error("❌ API Connection Error: Cannot reach backend at", getBaseURL());
    }
    return Promise.reject(error);
  }
);

export default API;