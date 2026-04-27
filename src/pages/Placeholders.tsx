import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const AIChatPage = () => (
  <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-4">
    <div className="text-6xl mb-4">🤖</div>
    <h1 className="font-syne font-bold text-3xl dark:text-white">AI Assistant</h1>
    <p className="text-slate-500 max-w-md">Upload a document to chat, summarize, and extract insights using Gemini AI.</p>
  </div>
);

export const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-6">
      <h1 className="font-syne font-extrabold text-9xl text-slate-200 dark:text-slate-800 tracking-tighter">404</h1>
      <div className="-mt-12 space-y-2 relative z-10">
        <h2 className="font-syne font-bold text-3xl dark:text-white">Page not found</h2>
        <p className="text-slate-500 max-w-md">The page you're looking for doesn't exist or has been moved.</p>
      </div>
      <Button variant="primary" onClick={() => navigate('/app')}>Go to Dashboard</Button>
    </div>
  );
};
