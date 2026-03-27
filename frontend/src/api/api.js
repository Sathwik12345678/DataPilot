import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://datapilot-0b2k.onrender.com",
});

export default API;