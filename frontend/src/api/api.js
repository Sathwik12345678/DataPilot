import axios from "axios";

const API = axios.create({
  baseURL: "https://datapilot-0b2k.onrender.com",
});

export default API;