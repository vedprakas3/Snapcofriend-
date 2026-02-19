import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NewSituation from './pages/NewSituation';
import Matches from './pages/Matches';
import FriendProfile from './pages/FriendProfile';
import Booking from './pages/Booking';
import Bookings from './pages/Bookings';
import Messages from './pages/Messages';
import Safety from './pages/Safety';
import Profile from './pages/Profile';
import FriendOnboarding from './pages/FriendOnboarding';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; requireFriend?: boolean; requireAdmin?: boolean }> = ({
  children,
  requireFriend = false,
  requireAdmin = false
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireFriend && !user?.isFriend) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Public Route - redirects to dashboard if authenticated
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Layout with Navbar and Footer
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

// App Routes
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <MainLayout>
              <Home />
            </MainLayout>
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <MainLayout>
              <Login />
            </MainLayout>
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <MainLayout>
              <Register />
            </MainLayout>
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/new-situation"
        element={
          <ProtectedRoute>
            <MainLayout>
              <NewSituation />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/matches"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Matches />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/friends/:id"
        element={
          <ProtectedRoute>
            <MainLayout>
              <FriendProfile />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/booking/:id"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Booking />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Bookings />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Messages />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages/:bookingId"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Messages />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/safety/:bookingId"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Safety />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Profile />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/friend-onboarding"
        element={
          <ProtectedRoute requireFriend>
            <MainLayout>
              <FriendOnboarding />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <MainLayout>
              <AdminDashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route
        path="*"
        element={
          <MainLayout>
            <NotFound />
          </MainLayout>
        }
      />
    </Routes>
  );
};

// Main App
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
      <Toaster position="top-right" />
    </AuthProvider>
  );
};

export default App;
