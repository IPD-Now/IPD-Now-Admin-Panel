import { Box, AppBar, Typography, styled, Container, IconButton, Avatar, Menu, MenuItem, Paper, Badge, ListItemIcon } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LogoutIcon from '@mui/icons-material/Logout';
import { useState, useEffect } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { format } from 'date-fns';
import { useNotifications } from '../context/NotificationsContext';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { useAuth } from '../context/AuthContext';
import { getHospitalDetails } from '../firebase';
import { toast } from 'react-toastify';

const HOSPITAL_NAME = 'City Hospital';

const Header = styled(AppBar)(({ theme }) => ({
  position: 'fixed',
  width: '100%',
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(1.5),
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  zIndex: theme.zIndex.appBar,
  borderBottom: '1px solid',
  borderColor: theme.palette.divider,
}));

const Logo = styled('img')(({ size = 'small' }) => ({
  height: size === 'small' ? 32 : 36,
  objectFit: 'contain',
}));

const LogoDivider = styled(Box)(({ theme }) => ({
  width: 1,
  height: 24,
  backgroundColor: theme.palette.divider,
  margin: theme.spacing(0, 2),
}));

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  marginTop: 72,
  marginBottom: 64,
  backgroundColor: theme.palette.background.default,
  minHeight: '100vh',
}));

const HeaderActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const IconContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(0.5),
  borderRadius: theme.shape.borderRadius,
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  width: 35,
  height: 35,
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(76, 175, 80, 0.2)'
    : 'rgba(3, 123, 65, 0.1)',
  color: theme.palette.primary.main,
  border: `1px solid ${theme.palette.primary.main}`,
  padding: theme.spacing(1),
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(76, 175, 80, 0.3)'
      : 'rgba(3, 123, 65, 0.15)',
    transform: 'scale(1.05)',
  },
  '& .MuiSvgIcon-root': {
    fontSize: '1.25rem',
  },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    fontWeight: 600,
    fontSize: '0.75rem',
    minWidth: 18,
    height: 18,
    padding: '0 4px',
  },
}));

const BottomNav = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: theme.palette.background.paper,
  borderTop: '1px solid',
  borderColor: theme.palette.divider,
  borderRadius: '16px 16px 0 0',
  zIndex: theme.zIndex.appBar,
}));

const BottomNavContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-around',
  padding: theme.spacing(1),
  width: '100%',
}));

const BottomNavItem = styled(Box)(({ theme, active }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  cursor: 'pointer',
  color: active ? theme.palette.primary.main : theme.palette.text.secondary,
  '&:hover': {
    color: theme.palette.primary.main,
  },
  '& .MuiSvgIcon-root': {
    fontSize: 24,
    marginRight: theme.spacing(1),
  },
  '& .label': {
    fontSize: '0.9rem',
    fontWeight: active ? 600 : 500,
  },
}));

const NotificationMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    width: 320,
    maxHeight: 400,
  },
}));

const NotificationItem = styled(MenuItem)(({ theme, unread }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: unread ? (
    theme.palette.mode === 'dark' 
      ? 'rgba(76, 175, 80, 0.1)'
      : 'rgba(76, 175, 80, 0.05)'
  ) : 'transparent',
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const EmptyNotification = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 35,
  height: 35,
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(76, 175, 80, 0.2)'
    : 'rgba(3, 123, 65, 0.1)',
  color: theme.palette.primary.main,
  fontWeight: 600,
  fontSize: '1rem',
  border: `1px solid ${theme.palette.primary.main}`,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark'
      ? 'rgba(76, 175, 80, 0.3)'
      : 'rgba(3, 123, 65, 0.15)',
    transform: 'scale(1.05)',
  },
}));

const StyledTime = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
  fontWeight: 500,
  padding: theme.spacing(0.75, 1.5),
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(76, 175, 80, 0.1)'
    : 'rgba(3, 123, 65, 0.05)',
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const { isDarkMode, toggleTheme } = useTheme();
  const { notifications, clearNotification, clearAllNotifications } = useNotifications();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hospitalDetails, setHospitalDetails] = useState(null);

  useEffect(() => {
    const fetchHospitalDetails = async () => {
      try {
        const hospitalId = localStorage.getItem('hospitalId');
        if (!hospitalId) {
          toast.error('Please login again');
          return;
        }
        const details = await getHospitalDetails(hospitalId);
        setHospitalDetails(details);
      } catch (error) {
        console.error('Error fetching hospital details:', error);
      }
    };

    fetchHospitalDetails();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleClearAll = async () => {
    const success = await clearAllNotifications();
    if (success) {
      handleNotificationClose(); // Close the menu after successful clearing
    }
  };

  const isActive = (path) => location.pathname === path;

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <DashboardRoundedIcon /> },
    { path: '/upcoming-patients', label: 'Patients', icon: <PeopleAltRoundedIcon /> },
    { path: '/contact', label: 'Support', icon: <SupportAgentRoundedIcon /> },
    { path: '/about', label: 'About', icon: <InfoRoundedIcon /> },
  ];

  const formatNotificationTime = (date) => {
    return format(new Date(date), 'h:mm a');
  };

  const getInitial = (name) => {
    return name.charAt(0).toUpperCase();
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Header elevation={0}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {hospitalDetails?.logoURL ? (
            <Avatar
              src={hospitalDetails.logoURL}
              alt={hospitalDetails.name}
              sx={{ 
                width: 40, 
                height: 40,
                mr: 2,
                border: theme => `1px solid ${theme.palette.divider}`
              }}
            />
          ) : (
            <Avatar
              sx={{ 
                width: 40, 
                height: 40,
                mr: 2,
                bgcolor: 'primary.main'
              }}
            >
              {hospitalDetails?.name?.charAt(0) || 'H'}
            </Avatar>
          )}
          <Box>
            <Typography variant="h6" color="text.primary" sx={{ fontWeight: 600, mb: 0, lineHeight: 1.1 }}>
              {hospitalDetails?.name || 'Hospital Dashboard'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.1 }}>
              <Typography variant="caption" color="text.secondary">
                Powered by
              </Typography>
              <Logo src="/ipd-now-logo.png" alt="IPD Now" size="small" sx={{ height: 14 }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main' }}>
                IPD Now
              </Typography>
            </Box>
          </Box>
        </Box>

        <HeaderActions>
          <StyledTime>
            {format(currentTime, 'h:mm a')}
          </StyledTime>
          
          <IconContainer>
            <StyledIconButton onClick={toggleTheme}>
              {isDarkMode ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
            </StyledIconButton>

            <StyledIconButton onClick={handleNotificationClick}>
              <StyledBadge badgeContent={notifications.length} color="error">
                <NotificationsRoundedIcon />
              </StyledBadge>
            </StyledIconButton>

            <StyledAvatar onClick={handleMenuClick}>
              {getInitial(hospitalDetails?.name || 'H')}
            </StyledAvatar>
          </IconContainer>

          <NotificationMenu
            anchorEl={notificationAnchorEl}
            open={Boolean(notificationAnchorEl)}
            onClose={handleNotificationClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <Box sx={{ 
              p: 2, 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Notifications
              </Typography>
              {notifications.length > 0 && (
                <IconButton 
                  size="small" 
                  onClick={handleClearAll}
                  title="Clear all notifications"
                >
                  <ClearAllIcon fontSize="small" />
                </IconButton>
              )}
            </Box>

            {notifications.length === 0 ? (
              <EmptyNotification>
                <Typography variant="body2">
                  No notifications
                </Typography>
              </EmptyNotification>
            ) : (
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {notifications.map((notification) => (
                  <NotificationItem 
                    key={notification.id}
                    unread={!notification.read}
                  >
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        mb: 0.5
                      }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {notification.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {formatNotificationTime(notification.timestamp)}
                          </Typography>
                          <IconButton 
                            size="small" 
                            onClick={() => clearNotification(notification.id)}
                            sx={{ ml: 1 }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {notification.message}
                      </Typography>
                    </Box>
                  </NotificationItem>
                ))}
              </Box>
            )}
          </NotificationMenu>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: { minWidth: 160 }
            }}
          >
            <MenuItem sx={{ color: 'error.main' }} onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" sx={{ color: 'error.main' }} />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </HeaderActions>
      </Header>

      <MainContent>
        <Container maxWidth="xl">
          <Outlet />
        </Container>
      </MainContent>

      <BottomNav elevation={0}>
        <BottomNavContent>
          {navigationItems.map((item) => (
            <BottomNavItem
              key={item.path}
              active={isActive(item.path)}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              <Typography className="label">
                {item.label}
              </Typography>
            </BottomNavItem>
          ))}
        </BottomNavContent>
      </BottomNav>
    </Box>
  );
};

export default Layout;