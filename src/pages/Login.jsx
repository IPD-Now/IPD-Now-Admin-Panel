import { useState } from 'react';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  styled,
  InputAdornment,
  IconButton,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import HospitalIcon from '@mui/icons-material/LocalHospital';

const LoginWrapper = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(45deg, #1a1a1a 0%, #2d2d2d 100%)'
    : 'linear-gradient(45deg, #f3f4f6 0%, #ffffff 100%)',
  padding: theme.spacing(3),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(4),
  width: '100%',
  maxWidth: 480,
  borderRadius: 20,
  position: 'relative',
  overflow: 'hidden',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 8px 32px rgba(0, 0, 0, 0.4)'
    : '0 8px 32px rgba(0, 0, 0, 0.08)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: theme.palette.primary.main,
  },
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(4),
}));

const Logo = styled('img')({
  height: 40,
  objectFit: 'contain',
});

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.05)'
      : 'rgba(0, 0, 0, 0.02)',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.08)'
        : 'rgba(0, 0, 0, 0.03)',
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.1)'
        : 'rgba(0, 0, 0, 0.04)',
    },
  },
}));

const LoginButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(1.5),
  borderRadius: 12,
  fontSize: '1rem',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: 'none',
  '&:hover': {
    boxShadow: 'none',
    backgroundColor: theme.palette.primary.dark,
  },
}));

const Login = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [formData, setFormData] = useState({
    hospitalId: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <LoginWrapper>
      <Container maxWidth="sm" sx={{ margin: 0 }}>
        <StyledPaper elevation={0}>
          <LogoContainer>
            <Logo src="/ipd-now-logo.png" alt="IPD Now Logo" />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                IPD Now
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hospital Management System
              </Typography>
            </Box>
          </LogoContainer>

          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Box sx={{ 
              display: 'inline-flex',
              p: 2,
              borderRadius: '50%',
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(76, 175, 80, 0.1)'
                : 'rgba(76, 175, 80, 0.08)',
              color: 'primary.main',
              mb: 2
            }}>
              <HospitalIcon sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please sign in to continue
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <StyledTextField
              fullWidth
              label="Hospital ID"
              name="hospitalId"
              value={formData.hospitalId}
              onChange={handleChange}
              required
              variant="outlined"
              placeholder="Enter your hospital ID"
            />
            <StyledTextField
              fullWidth
              label="Master Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              variant="outlined"
              placeholder="Enter your password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <LoginButton
              type="submit"
              fullWidth
              variant="contained"
              size="large"
            >
              Sign In
            </LoginButton>
          </Box>

          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ mt: 4, textAlign: 'center', display: 'block' }}
          >
            © 2024 IPD Now | Developed by Shudveta
          </Typography>
        </StyledPaper>
      </Container>
    </LoginWrapper>
  );
};

export default Login; 