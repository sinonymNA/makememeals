import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { AnimatePresence, motion } from 'framer-motion';
import { initTheme } from './lib/theme.js';
import Landing from './pages/Landing.jsx';
import Setup from './pages/Setup.jsx';
import Swipe from './pages/Swipe.jsx';
import WeekView from './pages/WeekView.jsx';
import Recipes from './pages/Recipes.jsx';
import GroceryList from './pages/GroceryList.jsx';
import Dashboard from './pages/Dashboard.jsx';
import GuestWeekView from './pages/GuestWeekView.jsx';
import GuestRecipes from './pages/GuestRecipes.jsx';
import GuestGroceryList from './pages/GuestGroceryList.jsx';

function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return null;
  if (!isSignedIn) return <Navigate to="/" replace />;
  return children;
}

function PageWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      style={{ minHeight: '100vh' }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Landing /></PageWrapper>} />

        {/* Authenticated routes */}
        <Route path="/dashboard"       element={<ProtectedRoute><PageWrapper><Dashboard /></PageWrapper></ProtectedRoute>} />
        <Route path="/setup"           element={<ProtectedRoute><PageWrapper><Setup /></PageWrapper></ProtectedRoute>} />
        <Route path="/swipe"           element={<ProtectedRoute><PageWrapper><Swipe /></PageWrapper></ProtectedRoute>} />
        <Route path="/week/:planId"    element={<ProtectedRoute><PageWrapper><WeekView /></PageWrapper></ProtectedRoute>} />
        <Route path="/recipes/:planId" element={<ProtectedRoute><PageWrapper><Recipes /></PageWrapper></ProtectedRoute>} />
        <Route path="/grocery/:planId" element={<ProtectedRoute><PageWrapper><GroceryList /></PageWrapper></ProtectedRoute>} />

        {/* Guest routes (no auth) */}
        <Route path="/guest-setup"            element={<PageWrapper><Setup isGuest /></PageWrapper>} />
        <Route path="/guest/week/:planId"     element={<PageWrapper><GuestWeekView /></PageWrapper>} />
        <Route path="/guest/recipes/:planId"  element={<PageWrapper><GuestRecipes /></PageWrapper>} />
        <Route path="/guest/grocery/:planId"  element={<PageWrapper><GuestGroceryList /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  useEffect(() => { initTheme(); }, []);

  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
