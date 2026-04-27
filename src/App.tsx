/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAppStore } from './store/appStore';

import LandingPage from './pages/LandingPage';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import ToolsPage from './pages/ToolsPage';
import ToolPage from './pages/ToolPage';
import AIChatPage from './pages/AIChatPage';
import FilesPage from './pages/FilesPage';
import ProfilePage from './pages/ProfilePage';
import PricingPage from './pages/PricingPage';
import { 
  NotFoundPage 
} from './pages/Placeholders';

export default function App() {
  const darkMode = useAppStore(state => state.darkMode);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <>
      <Toaster 
        position="top-right" 
        toastOptions={{
          className: 'dark:bg-slate-800 dark:text-white border border-slate-100 dark:border-slate-700 font-dm-sans',
          style: {
            background: darkMode ? '#1e293b' : '#ffffff',
            color: darkMode ? '#ffffff' : '#0f172a',
            borderRadius: '16px',
            boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.1)'
          }
        }} 
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="tools" element={<ToolsPage />} />
            <Route path="tools/:toolId" element={<ToolPage />} />
            <Route path="ai" element={<AIChatPage />} />
            <Route path="files" element={<FilesPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="pricing" element={<PricingPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
