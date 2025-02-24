import { Box, Typography, CircularProgress, styled } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

const LoadingWrapper = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(45deg, #1a1a1a 0%, #2d2d2d 100%)'
    : 'linear-gradient(45deg, #f3f4f6 0%, #ffffff 100%)',
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  backgroundColor: theme.palette.mode === 'dark'
    ? 'rgba(2, 105, 53, 0.1)'
    : 'rgba(2, 105, 53, 0.08)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
}));

const StyledProgress = styled(CircularProgress)({
  color: '#026935',
});

const LoadingScreen = () => {
  return (
    <LoadingWrapper>
      <LogoContainer>
        <IconWrapper>
          <LocalHospitalIcon
            sx={{
              fontSize: 40,
              color: '#026935',
            }}
          />
        </IconWrapper>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            mb: 1,
            color: '#026935',
          }}
        >
          IPD Now
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 4 }}
        >
          Hospital Management System
        </Typography>
        <StyledProgress size={32} />
      </LogoContainer>
    </LoadingWrapper>
  );
};

export default LoadingScreen;
