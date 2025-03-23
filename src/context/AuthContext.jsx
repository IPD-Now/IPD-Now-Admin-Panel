import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const hospitalId = localStorage.getItem('hospitalId');
      const lockedHospitalId = localStorage.getItem('lockedHospitalId');

      // If no hospital ID is stored, clear everything except lockedHospitalId
      if (!hospitalId) {
        const locked = localStorage.getItem('lockedHospitalId');
        localStorage.clear();
        if (locked) {
          localStorage.setItem('lockedHospitalId', locked);
        }
        setIsAuthenticated(false);
        // Only redirect to login if we're not already there
        if (location.pathname !== '/login') {
          navigate('/login');
        }
      } else {
        // If this is first successful login, lock the hospital ID
        if (!lockedHospitalId) {
          localStorage.setItem('lockedHospitalId', hospitalId);
        }
        setIsAuthenticated(true);
        // If we're on login page but already authenticated, go to dashboard
        if (location.pathname === '/login') {
          navigate('/dashboard');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [navigate, location]);

  const login = (hospitalData) => {
    // Store the hospital ID in localStorage if not already locked
    const lockedHospitalId = localStorage.getItem('lockedHospitalId');
    if (!lockedHospitalId) {
      localStorage.setItem('lockedHospitalId', hospitalData.id);
    }

    localStorage.setItem('hospitalId', hospitalData.id);
    localStorage.setItem('hospitalName', hospitalData.name);
    if (hospitalData.logoURL) {
      localStorage.setItem('hospitalLogo', hospitalData.logoURL);
    }
    localStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
  };

  const logout = () => {
    // Preserve the locked hospital ID
    const lockedHospitalId = localStorage.getItem('lockedHospitalId');
    
    // Clear all other data
    localStorage.clear();
    
    // Restore the locked hospital ID
    if (lockedHospitalId) {
      localStorage.setItem('lockedHospitalId', lockedHospitalId);
    }
    
    setIsAuthenticated(false);
    navigate('/login');
  };

  if (loading) {
    return null; // or a loading spinner
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 