import React from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import App from './App.tsx';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  
  if (!PUBLISHABLE_KEY) {
    root.render(
      <div className="h-screen flex items-center justify-center bg-[#0f2a43] text-white p-8 text-center">
        <div className="max-w-md">
          <h1 className="text-2xl font-bold mb-4">Configuration Required</h1>
          <p className="text-slate-300 mb-6">
            Please set the <code className="bg-white/10 px-2 py-1 rounded">VITE_CLERK_PUBLISHABLE_KEY</code> environment variable in the Settings menu to enable authentication.
          </p>
          <a 
            href="https://dashboard.clerk.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block bg-[#00a3e0] px-6 py-2 rounded-full font-bold hover:bg-[#0092c9] transition-colors"
          >
            Get Clerk Key
          </a>
        </div>
      </div>
    );
  } else {
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
            <App />
          </ClerkProvider>
        </ErrorBoundary>
      </React.StrictMode>
    );
  }
}
