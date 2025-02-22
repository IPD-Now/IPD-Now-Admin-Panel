import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";
import { collection, doc, getDoc, getDocs, updateDoc, deleteDoc, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBmpY53eI8HeVDX_tFFuwd0dgCBwiJW8cM",
  authDomain: "ipd-now.firebaseapp.com",
  projectId: "ipd-now",
  storageBucket: "ipd-now.firebasestorage.app",
  messagingSenderId: "358061283275",
  appId: "1:358061283275:web:6398580b6c0b3e8dbbc84e",
  measurementId: "G-BRQC891WL6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Analytics
export const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;

// Hospital Authentication
export const authenticateHospital = async (hospitalId, password) => {
  try {
    // Input validation
    if (!hospitalId || !password) {
      throw new Error('Hospital ID and password are required');
    }

    // Get hospital document
    const hospitalRef = doc(db, 'hospitals', hospitalId);
    const hospitalDoc = await getDoc(hospitalRef);

    if (!hospitalDoc.exists()) {
      throw new Error('Hospital not found');
    }

    const hospitalData = hospitalDoc.data();

    // In a real implementation, we would use a proper password hashing library
    // and compare hashed passwords. For now, we'll use a simple comparison
    // TODO: Implement proper password hashing
    if (hospitalData.masterPassword !== password) {
      // Use a generic error message for security
      throw new Error('Invalid credentials');
    }

    // Store minimal data in localStorage
    localStorage.setItem('hospitalId', hospitalId);
    localStorage.setItem('hospitalName', hospitalData.name);
    if (hospitalData.logoURL) {
      localStorage.setItem('hospitalLogo', hospitalData.logoURL);
    }

    // Return minimal data needed for the app
    return {
      id: hospitalId,
      name: hospitalData.name,
      logoURL: hospitalData.logoURL || null
    };
  } catch (error) {
    console.error('Authentication error:', error);
    // Throw generic error messages for security
    if (error.message === 'Hospital not found' || error.message === 'Invalid credentials') {
      throw new Error('Invalid credentials');
    }
    throw new Error('Authentication failed. Please try again later.');
  }
};

// Fetch Hospital Details
export const getHospitalDetails = async (hospitalId) => {
  try {
    const hospitalRef = doc(db, 'hospitals', hospitalId);
    const hospitalDoc = await getDoc(hospitalRef);
    
    if (!hospitalDoc.exists()) {
      throw new Error('Hospital not found');
    }
    
    return hospitalDoc.data();
  } catch (error) {
    throw error;
  }
};

// Department Operations
export const getDepartments = async (hospitalId) => {
  try {
    const departmentsRef = collection(db, 'hospitals', hospitalId, 'departments');
    const departmentsSnapshot = await getDocs(departmentsRef);
    return departmentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw error;
  }
};

export const updateDepartmentBeds = async (hospitalId, departmentId, newTotal) => {
  try {
    const departmentRef = doc(db, 'hospitals', hospitalId, 'departments', departmentId);
    await updateDoc(departmentRef, {
      totalBeds: newTotal
    });
    return true;
  } catch (error) {
    throw error;
  }
};

// Upcoming Patients Operations
export const getUpcomingPatients = async (hospitalId) => {
  try {
    const patientsRef = collection(db, 'hospitals', hospitalId, 'upcomingPatients');
    const patientsSnapshot = await getDocs(patientsRef);
    return patientsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw error;
  }
};

// Add this function to get department details
export const getDepartmentDetails = async (hospitalId, departmentId) => {
  try {
    const departmentRef = doc(db, 'hospitals', hospitalId, 'departments', departmentId);
    const departmentDoc = await getDoc(departmentRef);
    if (!departmentDoc.exists()) {
      throw new Error('Department not found');
    }
    return departmentDoc.data();
  } catch (error) {
    throw error;
  }
};

// Update department bed count
export const updateDepartmentBedCount = async (hospitalId, departmentId, increment) => {
  try {
    const departmentRef = doc(db, 'hospitals', hospitalId, 'departments', departmentId);
    const departmentDoc = await getDoc(departmentRef);
    if (!departmentDoc.exists()) {
      throw new Error('Department not found');
    }

    const currentData = departmentDoc.data();
    const newOccupiedBeds = (currentData.occupiedBeds || 0) + increment;
    
    if (newOccupiedBeds < 0) {
      throw new Error('Cannot have negative occupied beds');
    }
    
    if (newOccupiedBeds > currentData.totalBeds) {
      throw new Error('No beds available');
    }

    await updateDoc(departmentRef, {
      occupiedBeds: newOccupiedBeds
    });
    
    return true;
  } catch (error) {
    throw error;
  }
};

export const admitPatient = async (hospitalId, patientId) => {
  try {
    if (!hospitalId || !patientId) {
      throw new Error('Hospital ID and patient ID are required');
    }

    // Get patient details first
    const patientRef = doc(db, 'hospitals', hospitalId, 'upcomingPatients', patientId);
    const patientDoc = await getDoc(patientRef);
    if (!patientDoc.exists()) {
      throw new Error('Patient not found');
    }
    
    const patientData = patientDoc.data();
    
    // Get department by ID
    const departmentRef = doc(db, 'hospitals', hospitalId, 'departments', patientData.departmentId);
    const departmentDoc = await getDoc(departmentRef);
    
    if (!departmentDoc.exists()) {
      throw new Error('Department not found');
    }

    const departmentData = departmentDoc.data();
    const availableBeds = departmentData.availableBeds || 0;

    // Check if beds are available
    if (availableBeds <= 0) {
      throw new Error('No beds available');
    }

    // Update department's available beds count
    await updateDoc(departmentRef, {
      availableBeds: availableBeds - 1
    });

    // Update patient status
    await updateDoc(patientRef, {
      status: 'Admitted',
      admissionDate: serverTimestamp(),
      admissionDateTime: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error('Error in admitPatient:', error);
    if (error.message === 'No beds available') {
      throw new Error('Cannot admit patient: No beds available in this department');
    }
    throw error;
  }
};

export const dischargePatient = async (hospitalId, patientId) => {
  try {
    if (!hospitalId || !patientId) {
      throw new Error('Hospital ID and patient ID are required');
    }

    // Get patient details first
    const patientRef = doc(db, 'hospitals', hospitalId, 'upcomingPatients', patientId);
    const patientDoc = await getDoc(patientRef);
    if (!patientDoc.exists()) {
      throw new Error('Patient not found');
    }
    
    const patientData = patientDoc.data();
    
    // Get department by ID
    const departmentRef = doc(db, 'hospitals', hospitalId, 'departments', patientData.departmentId);
    const departmentDoc = await getDoc(departmentRef);
    
    if (!departmentDoc.exists()) {
      throw new Error('Department not found');
    }

    const departmentData = departmentDoc.data();
    const availableBeds = departmentData.availableBeds || 0;
    const totalBeds = departmentData.totalBeds || 0;

    // Update department's available beds count
    await updateDoc(departmentRef, {
      availableBeds: Math.min(totalBeds, availableBeds + 1)
    });

    // Update patient status
    await updateDoc(patientRef, {
      status: 'Discharged',
      dischargeDate: serverTimestamp(),
      dischargeDateTime: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error('Error in dischargePatient:', error);
    throw error;
  }
};

// Real-time Upcoming Patients Listener
export const subscribeToUpcomingPatients = (hospitalId, callback) => {
  const patientsRef = collection(db, 'hospitals', hospitalId, 'upcomingPatients');
  const q = query(patientsRef);
  
  return onSnapshot(q, (snapshot) => {
    const patients = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // Handle different timestamp fields
      let timestamp;
      if (data.timestamp?.toDate) {
        timestamp = data.timestamp.toDate();
      } else if (data.createdAt) {
        timestamp = new Date(data.createdAt);
      } else {
        timestamp = new Date();
      }

      patients.push({
        id: doc.id,
        ...data,
        timestamp
      });
    });
    
    // Sort by timestamp, newest first
    patients.sort((a, b) => b.timestamp - a.timestamp);
    callback(patients);
  }, (error) => {
    console.error('Error listening to patients:', error);
    toast.error('Error updating patient list');
  });
};

// Real-time Notifications Listener
export const subscribeToNotifications = (hospitalId, callback) => {
  if (!hospitalId) return () => {};

  const notificationsRef = collection(db, 'hospitals', hospitalId, 'notifications');
  const q = query(notificationsRef, where('read', '==', false));
  
  return onSnapshot(q, 
    (snapshot) => {
      const notifications = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        notifications.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp ? data.timestamp.toDate() : new Date()
        });
      });
      // Sort notifications by timestamp, newest first
      notifications.sort((a, b) => b.timestamp - a.timestamp);
      callback(notifications);
    },
    (error) => {
      console.error('Error listening to notifications:', error);
      // Don't show error toast here as it might be due to initial collection creation
    }
  );
};

// Add a new notification
export const addNotification = async (hospitalId, notification) => {
  try {
    if (!hospitalId) throw new Error('Hospital ID is required');

    const notificationsRef = collection(db, 'hospitals', hospitalId, 'notifications');
    const newNotification = {
      ...notification,
      title: notification.title || 'New Notification',
      message: notification.message || '',
      timestamp: serverTimestamp(),
      read: false,
      createdAt: new Date().toISOString(),
      type: notification.type || 'info'
    };

    const docRef = await addDoc(notificationsRef, newNotification);
    if (!docRef.id) throw new Error('Failed to create notification');
    
    return true;
  } catch (error) {
    console.error('Error adding notification:', error);
    return false;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (hospitalId, notificationId) => {
  try {
    if (!hospitalId || !notificationId) throw new Error('Hospital ID and notification ID are required');

    const notificationRef = doc(db, 'hospitals', hospitalId, 'notifications', notificationId);
    const notificationDoc = await getDoc(notificationRef);
    
    if (!notificationDoc.exists()) {
      console.error('Notification not found');
      return false;
    }

    await updateDoc(notificationRef, {
      read: true,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

// Clear all notifications
export const clearAllNotifications = async (hospitalId) => {
  try {
    if (!hospitalId) throw new Error('Hospital ID is required');

    const notificationsRef = collection(db, 'hospitals', hospitalId, 'notifications');
    const q = query(notificationsRef, where('read', '==', false));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return true;

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      const notificationRef = doc.ref;
      batch.update(notificationRef, {
        read: true,
        updatedAt: serverTimestamp()
      });
    });
    
    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error clearing notifications:', error);
    return false;
  }
}; 