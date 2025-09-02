import React from 'react';
import { createRoot } from 'react-dom/client';
import AppRouter from './router/router.tsx';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>,
);
