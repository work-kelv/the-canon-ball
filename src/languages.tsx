import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Shell } from './App';
import { LanguagesPage } from './components/LanguagesPage';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Shell section="languages">{() => <LanguagesPage />}</Shell>
  </StrictMode>,
);
