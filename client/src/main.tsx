import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import App from './App';
import './index.css';

// Set base URL for production API requests.
// Replace with your live Render backend URL once backend is hosted.
axios.defaults.baseURL = import.meta.env.PROD
  ? 'https://organic-api-vishnu.onrender.com'
  : '';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
