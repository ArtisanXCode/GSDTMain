import { Buffer } from 'buffer';

// Polyfill Buffer for browser compatibility
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
  (window as any).global = window;
}

import React from 'react'
import ReactDOM from 'react-dom/client'
import './globals.css'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);