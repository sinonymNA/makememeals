import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />

        {/* Authenticated routes */}
        <Route path="/dashboard"          element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/setup"              element={<ProtectedRoute><Setup /></ProtectedRoute>} />
        <Route path="/swipe"              element={<ProtectedRoute><Swipe /></ProtectedRoute>} />
        <Route path="/week/:planId"       element={<ProtectedRoute><WeekView /></ProtectedRoute>} />
        <Route path="/recipes/:planId"    element={<ProtectedRoute><Recipes /></ProtectedRoute>} />
        <Route path="/grocery/:planId"    element={<ProtectedRoute><GroceryList /></ProtectedRoute>} />

        {/* Guest routes (no auth) */}
        <Route path="/guest-setup"             element={<Setup isGuest />} />
        <Route path="/guest/week/:planId"      element={<GuestWeekView />} />
        <Route path="/guest/recipes/:planId"   element={<GuestRecipes />} />
        <Route path="/guest/grocery/:planId"   element={<GuestGroceryList />} />
      </Routes>
    </BrowserRouter>
  );
}
