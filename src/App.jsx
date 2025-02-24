import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UpcomingPatients from './pages/UpcomingPatients';
import About from './pages/About';
import Contact from './pages/Contact';
import Layout from './components/Layout';
import { ThemeProvider } from './theme/ThemeContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { PatientsProvider } from './context/PatientsContext';
import { ToastContainer } from 'react-toastify';
import { CssBaseline } from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';
import { useState, useEffect } from 'react';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial app loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider>
      <NotificationsProvider>
        <PatientsProvider>
          <Router>
            <AuthProvider>
              <CssBaseline />
              <ToastContainer position="bottom-center" />
              <Routes>
                <Route path="/login" element={<Login />} />
                
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="upcoming-patients" element={<UpcomingPatients />} />
                  <Route path="about" element={<About />} />
                  <Route path="contact" element={<Contact />} />
                </Route>

                {/* Catch all route - redirect to dashboard if authenticated, login if not */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </AuthProvider>
          </Router>
        </PatientsProvider>
      </NotificationsProvider>
    </ThemeProvider>
  );
}

export default App;
