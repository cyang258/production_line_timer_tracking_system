import axios from 'axios';

// save from repeated work on write base url as well as dynamically control the url we want to call
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
});

export default api;