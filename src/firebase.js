import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

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