import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY || 'pk_test_placeholder'}>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: "'Fredoka', sans-serif",
            fontWeight: 700,
            borderRadius: '16px',
            padding: '12px 18px',
          },
          success: { iconTheme: { primary: '#7DB87A', secondary: 'white' } },
          error: { iconTheme: { primary: '#E05A5A', secondary: 'white' } },
        }}
      />
    </ClerkProvider>
  </StrictMode>
);
