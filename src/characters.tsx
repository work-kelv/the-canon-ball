import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Shell } from './App';
import { CharactersPage } from './components/characters/CharactersPage';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Shell section="characters">{(dark) => <CharactersPage dark={dark} />}</Shell>
  </StrictMode>,
);
