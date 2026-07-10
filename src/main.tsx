import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Temporarily add global error handlers to help catch startup issues on iOS/WebKit
if (typeof window !== 'undefined') {
  window.onerror = (message, source, lineno, colno, error) => {
    console.error('Global Error:', message, source, lineno, colno, error);
  };
  window.onunhandledrejection = (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
