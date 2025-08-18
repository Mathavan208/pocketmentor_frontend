import React from 'react';
import ReactDOM from 'react-dom/client';
import { gsap } from 'gsap';
import Router from './Router';
import './index.css';
import App from './App';
// Initialize GSAP
gsap.config({ nullTargetWarn: false });

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);