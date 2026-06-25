import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { AnimatePresence, motion } from 'framer-motion';
import { initTheme } from './lib/theme.js';
import Demo from './pages/Demo.jsx';
import Home from './pages/Home.jsx';
import RecipeDetail from './pages/Recipe.jsx';
import Setup from './pages/Setup.jsx';
import Swipe from './pages/Swipe.jsx';
import WeekView from './pages/WeekView.jsx';
import Recipes from './pages/Recipes.jsx';
import GroceryList from './pages/GroceryList.jsx';
import Dashboard from './pages/Dashboard.jsx';
import GuestWeekView from './pages/GuestWeekView.jsx';
import GuestRecipes from './pages/GuestRecipes.jsx';
import GuestGroceryList from './pages/GuestGroceryList.jsx';
import NotFound from './pages/NotFound.jsx';
import RecipeCardCollection from './pages/RecipeCardCollection.jsx';
import Pantry from './pages/Pantry.jsx';
import Coupons from './pages/Coupons.jsx';
import ShopHome from './pages/shop/ShopHome.jsx';
import ShopProduct from './pages/shop/ShopProduct.jsx';
import ShopCart from './pages/shop/ShopCart.jsx';
import ShopCheckout from './pages/shop/ShopCheckout.jsx';
import ShopOrder from './pages/shop/ShopOrder.jsx';
import AdminOrders from './pages/AdminOrders.jsx';

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
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/recipe/:id" element={<PageWrapper><RecipeDetail /></PageWrapper>} />
        <Route path="/demo" element={<PageWrapper><Demo /></PageWrapper>} />

        {/* Authenticated routes */}
        <Route path="/dashboard"       element={<ProtectedRoute><PageWrapper><Dashboard /></PageWrapper></ProtectedRoute>} />
        <Route path="/setup"           element={<ProtectedRoute><PageWrapper><Setup /></PageWrapper></ProtectedRoute>} />
        <Route path="/swipe"           element={<ProtectedRoute><PageWrapper><Swipe /></PageWrapper></ProtectedRoute>} />
        <Route path="/week/:planId"    element={<ProtectedRoute><PageWrapper><WeekView /></PageWrapper></ProtectedRoute>} />
        <Route path="/recipes/:planId" element={<ProtectedRoute><PageWrapper><Recipes /></PageWrapper></ProtectedRoute>} />
        <Route path="/grocery/:planId" element={<ProtectedRoute><PageWrapper><GroceryList /></PageWrapper></ProtectedRoute>} />
        <Route path="/recipe-cards"    element={<ProtectedRoute><PageWrapper><RecipeCardCollection /></PageWrapper></ProtectedRoute>} />
        <Route path="/pantry"          element={<ProtectedRoute><PageWrapper><Pantry /></PageWrapper></ProtectedRoute>} />
        <Route path="/coupons"         element={<ProtectedRoute><PageWrapper><Coupons /></PageWrapper></ProtectedRoute>} />
        <Route path="/admin/orders"    element={<ProtectedRoute><PageWrapper><AdminOrders /></PageWrapper></ProtectedRoute>} />

        {/* Shop (open to guests and signed-in users) */}
        <Route path="/shop"             element={<PageWrapper><ShopHome /></PageWrapper>} />
        <Route path="/shop/cart"        element={<PageWrapper><ShopCart /></PageWrapper>} />
        <Route path="/shop/checkout"    element={<PageWrapper><ShopCheckout /></PageWrapper>} />
        <Route path="/shop/order/:id"   element={<PageWrapper><ShopOrder /></PageWrapper>} />
        <Route path="/shop/:slug"       element={<PageWrapper><ShopProduct /></PageWrapper>} />

        {/* Guest routes (no auth) */}
        <Route path="/guest-setup"            element={<PageWrapper><Setup isGuest /></PageWrapper>} />
        <Route path="/guest/week/:planId"     element={<PageWrapper><GuestWeekView /></PageWrapper>} />
        <Route path="/guest/recipes/:planId"  element={<PageWrapper><GuestRecipes /></PageWrapper>} />
        <Route path="/guest/grocery/:planId"  element={<PageWrapper><GuestGroceryList /></PageWrapper>} />

        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
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
