import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { App } from './App';
import { AdminDashboard } from './components/admin/AdminDashboard';
import './index.css';
import { FullscreenProvider } from './contexts/FullscreenContext';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />
  },
  {
    path: '/admin',
    element: <AdminDashboard />
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FullscreenProvider>
      <RouterProvider router={router} />
    </FullscreenProvider>
  </StrictMode>
);