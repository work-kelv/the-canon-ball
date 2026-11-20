import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Shell } from './App';
import { MapPage } from './components/map/MapPage';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Shell section="map">{() => <MapPage />}</Shell>
  </StrictMode>,
);
