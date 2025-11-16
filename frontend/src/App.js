import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import LoadingScreen from './components/LoadingScreen';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AllUsers from './pages/AllUsers';
import Notes from './pages/Notes';
import Reports from './pages/Reports';
import AddProperty from './pages/AddProperty';
import EditProperty from './pages/EditProperty';
import Properties from './pages/Properties';
import PropertyDetails from './pages/PropertyDetails';
import Home from './pages/Home';

// WWW Redirect Component
const WWWRedirect = ({ children }) => {
  useEffect(() => {
    // Only redirect if on www subdomain, not on non-www
    if (window.location.hostname === 'www.yugproperties.co.in') {
      const newUrl = 'https://yugproperties.co.in' + window.location.pathname + window.location.search;
      window.location.replace(newUrl);
    }
  }, []);

  // Don't render anything if we're on www (will redirect)
  if (window.location.hostname === 'www.yugproperties.co.in') {
    return <LoadingScreen />;
  }

  return children;
};

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin/dashboard' : '/profile'} />;
  }

  return children;
};

function App() {
  return (
    <WWWRedirect>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="App">
              <Navbar />
              <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/properties/:id" element={<PropertyDetails />} />
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/signup"
                element={
                  <PublicRoute>
                    <Signup />
                  </PublicRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/add-property"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AddProperty />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/edit-property/:id"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <EditProperty />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <AllUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/notes"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <Notes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute adminOnly={true}>
                    <Reports />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
    </WWWRedirect>
  );
}

export default App;
