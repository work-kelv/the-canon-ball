import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Shell } from './App';
import { BiblePage } from './components/BiblePage';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Shell section="languages">{() => <BiblePage />}</Shell>
  </StrictMode>,
);
