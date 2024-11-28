import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth';
import { getFirestore, collection } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAhXrR7-w_AqPtf3vz1PE64gUM44PWSsRE",
  authDomain: "whattoproduce.firebaseapp.com",
  projectId: "whattoproduce",
  storageBucket: "whattoproduce.appspot.com",
  messagingSenderId: "164035573709",
  appId: "1:164035573709:web:456ff529f79068aa53f684",
  measurementId: "G-6X3CS8RZKS"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);

// Set persistence to LOCAL immediately
setPersistence(auth, browserLocalPersistence).catch(console.error);

// Initialize Firestore
export const db = getFirestore(app);
export const configurationsRef = collection(db, 'configurations');

// Initialize Analytics conditionally
const initializeAnalytics = async () => {
  try {
    const analyticsSupported = await isSupported();
    if (analyticsSupported) {
      return getAnalytics(app);
    }
    return null;
  } catch {
    console.warn('Analytics not supported in this environment');
    return null;
  }
};

export const analytics = initializeAnalytics();

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});