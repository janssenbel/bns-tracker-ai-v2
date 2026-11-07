import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register Service Worker for complete offline access
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const baseUrl = import.meta.env.BASE_URL || '/';
    const swUrl = `${baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'}sw.js`;
    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        console.log('[BelBros PWA] Offline Service Worker registered:', registration.scope);
      })
      .catch((error) => {
        console.warn('[BelBros PWA] Service Worker registration failed:', error);
      });
  });
}

createRoot(document.getElementById('root')!).render(<App />);

