import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { App } from './App';
import './index.css';
import { FullscreenProvider } from './contexts/FullscreenContext';

// Lazy load the admin dashboard since it's admin-only and quite large
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })));

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />
  },
  {
    path: '/admin',
    element: (
      <Suspense fallback={<div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading Admin Dashboard...</div>
      </div>}>
        <AdminDashboard />
      </Suspense>
    )
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FullscreenProvider>
      <RouterProvider router={router} />
    </FullscreenProvider>
  </StrictMode>
);