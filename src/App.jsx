import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ThemeProvider } from './theme/ThemeContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { PatientsProvider } from './context/PatientsContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UpcomingPatients from './pages/UpcomingPatients';
import Contact from './pages/Contact';
import About from './pages/About';

function App() {
  return (
    <ThemeProvider>
      <NotificationsProvider>
        <PatientsProvider>
          <CssBaseline />
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={<Layout />}
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="upcoming-patients" element={<UpcomingPatients />} />
                <Route path="contact" element={<Contact />} />
                <Route path="about" element={<About />} />
              </Route>
            </Routes>
          </Router>
          <ToastContainer position="bottom-center" />
        </PatientsProvider>
      </NotificationsProvider>
    </ThemeProvider>
  );
}

export default App;
