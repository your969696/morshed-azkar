import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

window.onerror = (msg, src, line, col, err) => {
  const el = document.getElementById('root');
  if (el) el.innerHTML = '<pre style="color:red;padding:20px;white-space:pre-wrap;direction:ltr">' + String(msg) + '\n' + String(err?.stack || '') + '</pre>';
};
window.addEventListener('unhandledrejection', (e) => {
  const el = document.getElementById('root');
  if (el) el.innerHTML = '<pre style="color:red;padding:20px;white-space:pre-wrap;direction:ltr">Unhandled: ' + String(e.reason) + '\n' + String(e.reason?.stack || '') + '</pre>';
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
