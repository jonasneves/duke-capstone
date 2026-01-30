import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { UserMenuProvider } from '@/framework';
import { router } from './router';
import './styles/global.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <UserMenuProvider>
      <RouterProvider router={router} />
    </UserMenuProvider>
  </StrictMode>
);
