import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './assets/styles/responsive.css'
import App from './App.jsx'

// Mount the app and log rendering for debugging
const rootElement = document.getElementById('root');
console.log('Mounting React app to root element:', rootElement);

const root = createRoot(rootElement);
console.log('Root created, rendering App component');

root.render(
  <StrictMode>
    <App />
  </StrictMode>
)
