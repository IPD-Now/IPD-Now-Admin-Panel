import { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import notificationSound from '../assets/ting.mp3';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';

const NotificationContext = createContext();

export const useNotifications = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [audio] = useState(new Audio(notificationSound));

  useEffect(() => {
    const hospitalId = localStorage.getItem('hospitalId');
    if (!hospitalId) return;

    // Listen for new upcoming patients
    const upcomingPatientsRef = collection(db, 'hospitals', hospitalId, 'upcomingPatients');
    const q = query(upcomingPatientsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' && change.doc.data().createdAt) {
          // Check if this is a new document (not from initial load)
          const now = new Date();
          const docCreatedAt = change.doc.data().createdAt.toDate();
          const timeDiff = now - docCreatedAt;
          
          // Only show notification for documents created in the last 5 seconds
          if (timeDiff < 5000) {
            const patientData = change.doc.data();
            const notification = {
              id: change.doc.id,
              type: 'NEW_PATIENT',
              title: 'New Patient Registered',
              message: `${patientData.name} has registered for ${patientData.department}`,
              timestamp: patientData.createdAt,
              read: false,
              data: patientData,
              patientName: patientData.name,
              department: patientData.department
            };

            // Play notification sound
            audio.play().catch(err => console.log('Audio play failed:', err));

            // Update notifications state with the new notification
            setNotifications(prev => {
              // Check if notification already exists
              const exists = prev.some(n => n.id === notification.id);
              if (!exists) {
                return [notification, ...prev];
              }
              return prev;
            });
            setUnreadCount(prev => prev + 1);

            // Show toast notification if not on login page
            if (!window.location.pathname.includes('login')) {
              toast.info(
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '8px 0'
                }}>
                  <div style={{ 
                    backgroundColor: '#037B41',
                    borderRadius: '50%',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <LocalHospitalRoundedIcon style={{ color: '#fff', fontSize: '20px' }} />
                  </div>
                  <div>
                    <div style={{ 
                      fontWeight: 600,
                      marginBottom: '4px',
                      color: '#037B41'
                    }}>
                      New Patient Registered
                    </div>
                    <div style={{ fontSize: '14px', color: '#333' }}>
                      {patientData.name}
                    </div>
                    <div style={{ 
                      fontSize: '12px',
                      color: '#666',
                      marginTop: '2px'
                    }}>
                      {patientData.department}
                    </div>
                  </div>
                </div>,
                {
                  autoClose: 5000,
                  position: "top-right",
                  style: {
                    background: '#fff',
                    border: '1px solid #037B41',
                    borderLeft: '4px solid #037B41'
                  },
                  progressStyle: {
                    background: '#037B41'
                  },
                  icon: false
                }
              );
            }
          }
        }
      });
    });

    return () => unsubscribe();
  }, [audio]);

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId
          ? { ...notif, read: true }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  };

  const clearNotification = (notificationId) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 