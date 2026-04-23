import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// Error boundary wrapper for debugging
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('Root element not found!');
} else {
  try {
    console.log('Starting React render...');
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('React render completed successfully');
  } catch (error) {
    console.error('React render failed:', error);
    rootElement.innerHTML = `
      <div style="padding: 48px; text-align: center;">
        <h1 style="color: #E74C3C;">React Render Error</h1>
        <pre style="text-align: left; background: #f5f5f5; padding: 16px; border-radius: 8px; overflow: auto;">
          ${error}
        </pre>
      </div>
    `;
  }
}
