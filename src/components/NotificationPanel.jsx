import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  ListItemText,
  Typography,
  Box,
  Divider,
  Button,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import { useNotifications } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationPanel = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearNotification,
    clearAllNotifications 
  } = useNotifications();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    navigate('/upcoming-patients');
    handleClose();
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ mr: 2 }}
      >
        <Badge 
          badgeContent={unreadCount} 
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: '#037B41',
              color: '#fff'
            }
          }}
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 400,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            border: '1px solid #eee',
            borderRadius: '12px',
            '& .MuiList-root': {
              padding: 0
            }
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid #eee'
        }}>
          <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
            Notifications
          </Typography>
          <Box>
            <Button 
              size="small" 
              onClick={markAllAsRead}
              startIcon={<CheckCircleIcon />}
              sx={{ 
                mr: 1,
                color: '#037B41',
                '&:hover': {
                  backgroundColor: 'rgba(3, 123, 65, 0.08)'
                }
              }}
            >
              Mark all read
            </Button>
            <Button 
              size="small" 
              onClick={clearAllNotifications}
              startIcon={<DeleteIcon />}
              sx={{
                color: '#d32f2f',
                '&:hover': {
                  backgroundColor: 'rgba(211, 47, 47, 0.08)'
                }
              }}
            >
              Clear all
            </Button>
          </Box>
        </Box>

        {notifications.length === 0 ? (
          <Box sx={{ 
            p: 3, 
            textAlign: 'center',
            color: '#666'
          }}>
            <Typography variant="body1">
              No notifications yet
            </Typography>
          </Box>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                py: 2,
                px: 2,
                borderBottom: '1px solid #eee',
                backgroundColor: notification.read ? 'inherit' : 'rgba(3, 123, 65, 0.04)',
                '&:hover': {
                  backgroundColor: notification.read ? 'rgba(0, 0, 0, 0.04)' : 'rgba(3, 123, 65, 0.08)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                <Box sx={{ 
                  mr: 2,
                  backgroundColor: notification.read ? '#eee' : '#037B41',
                  borderRadius: '50%',
                  p: 1,
                  display: 'flex'
                }}>
                  <LocalHospitalRoundedIcon sx={{ 
                    fontSize: '20px',
                    color: notification.read ? '#666' : '#fff'
                  }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      fontWeight: 600,
                      color: notification.read ? '#333' : '#037B41',
                      mb: 0.5
                    }}
                  >
                    {notification.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#333' }}>
                    {notification.patientName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666', display: 'block', mt: 0.5 }}>
                    {notification.department} • {formatDistanceToNow(notification.timestamp.toDate(), { addSuffix: true })}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearNotification(notification.id);
                  }}
                  sx={{
                    color: '#666',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      color: '#d32f2f'
                    }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

export default NotificationPanel; 