import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { store } from './data/store';
import { loadThemeFonts } from './themes';
import './styles.css';
import './ui/clear.css';

declare const __PREVIEW__: boolean;
declare const __STAGING__: boolean;

void loadThemeFonts('wyspy');
async function start() {
  if (__STAGING__) {
    const { seedPreview, PreviewBanner } = await import('./preview');
    await store.init();
    await seedPreview();
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <PreviewBanner />
        <App />
      </StrictMode>,
    );
  } else {
    void store.init();
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  }
}
void start();

// Tryb offline i instalacja na ekranie głównym (iPad, Android, Windows).
if (!__PREVIEW__ && !__STAGING__ && 'serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      /* bez trybu offline — aplikacja działa dalej */
    });
  });
}
