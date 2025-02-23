import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { subscribeToNotifications, addNotification as addFirebaseNotification, markNotificationAsRead, clearAllNotifications as clearFirebaseNotifications } from '../firebase';
import { toast } from 'react-toastify';

const NotificationsContext = createContext(null);

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const hospitalId = localStorage.getItem('hospitalId');
    if (!hospitalId) {
      setIsLoading(false);
      return;
    }

    // Subscribe to notifications
    const unsubscribe = subscribeToNotifications(hospitalId, (updatedNotifications) => {
      setNotifications(updatedNotifications);
      setIsLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const addNotification = useCallback(async (notification) => {
    const hospitalId = localStorage.getItem('hospitalId');
    if (!hospitalId) {
      console.error('No hospital ID found');
      return false;
    }

    try {
      const success = await addFirebaseNotification(hospitalId, notification);
      if (!success) {
        console.error('Failed to add notification');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error adding notification:', error);
      return false;
    }
  }, []);

  const clearNotification = useCallback(async (notificationId) => {
    const hospitalId = localStorage.getItem('hospitalId');
    if (!hospitalId) {
      console.error('No hospital ID found');
      return false;
    }

    try {
      const success = await markNotificationAsRead(hospitalId, notificationId);
      if (success) {
        // Remove the notification from local state
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error clearing notification:', error);
      return false;
    }
  }, []);

  const clearAllNotifications = useCallback(async () => {
    const hospitalId = localStorage.getItem('hospitalId');
    if (!hospitalId) {
      toast.error('No hospital ID found');
      return false;
    }

    try {
      setIsLoading(true);
      const success = await clearFirebaseNotifications(hospitalId);
      if (success) {
        setNotifications([]);
        return true;
      }
      toast.error('Failed to clear notifications');
      return false;
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      toast.error('Error clearing notifications');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = {
    notifications,
    isLoading,
    addNotification,
    clearNotification,
    clearAllNotifications,
    hasNotifications: notifications.length > 0
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};