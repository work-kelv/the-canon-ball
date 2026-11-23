import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Shell } from './App';
import { HistoryPage } from './components/history/HistoryPage';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Shell section="history">{() => <HistoryPage />}</Shell>
  </StrictMode>,
);
