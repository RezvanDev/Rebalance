// api.js
import axios from 'axios';
import { BASE_URL } from "../constants/baseUrl";

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  }
});

export default api;