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
      if (!hospitalId) {
        // Clear any stale data
        localStorage.clear();
        setIsAuthenticated(false);
        // Only redirect to login if we're not already there
        if (location.pathname !== '/login') {
          navigate('/login');
        }
      } else {
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
    localStorage.setItem('hospitalId', hospitalData.id);
    localStorage.setItem('hospitalName', hospitalData.name);
    if (hospitalData.logoURL) {
      localStorage.setItem('hospitalLogo', hospitalData.logoURL);
    }
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.clear();
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