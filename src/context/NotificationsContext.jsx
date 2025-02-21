import { createContext, useContext, useState } from 'react';

const NotificationsContext = createContext({
  notifications: [],
  addNotification: () => {},
  clearNotification: () => {},
  clearAllNotifications: () => {},
});

export const useNotifications = () => useContext(NotificationsContext);

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    setNotifications(prev => [{
      id: Date.now(),
      timestamp: new Date(),
      read: false,
      ...notification
    }, ...prev]);
  };

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationsContext.Provider 
      value={{ 
        notifications, 
        addNotification, 
        clearNotification,
        clearAllNotifications
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}; 