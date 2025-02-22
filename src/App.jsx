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

function App() {
  return (
    <ThemeProvider>
      <NotificationsProvider>
        <PatientsProvider>
          <Router>
            <AuthProvider>
              <CssBaseline />
              <ToastContainer position="bottom-center" />
              <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/upcoming-patients" element={<UpcomingPatients />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                </Route>
              </Routes>
            </AuthProvider>
          </Router>
        </PatientsProvider>
      </NotificationsProvider>
    </ThemeProvider>
  );
}

export default App;
