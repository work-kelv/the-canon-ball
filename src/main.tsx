import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Shell } from './App';
import { HomePage } from './components/HomePage';
import './index.css';

// Old single-page links (#characters, #characters/network, #map) now live on their own pages.
const legacy = location.hash.match(/^#(characters|map)(?:\/(.*))?$/);
if (legacy) {
  location.replace(`${legacy[1]}.html${legacy[2] ? '#' + legacy[2] : ''}`);
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Shell section="home">{() => <HomePage />}</Shell>
    </StrictMode>,
  );
}
