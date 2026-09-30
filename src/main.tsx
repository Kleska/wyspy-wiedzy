import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { store } from './data/store';
import { loadThemeFonts } from './themes';
import './styles.css';

declare const __PREVIEW__: boolean;

void loadThemeFonts('wyspy');
void store.init();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Tryb offline i instalacja na ekranie głównym (iPad, Android, Windows).
if (!__PREVIEW__ && 'serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      /* bez trybu offline — aplikacja działa dalej */
    });
  });
}
