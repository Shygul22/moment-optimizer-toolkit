// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDx7uGAi9MsZ6LkHSdKogJ8nE2DmdC6h6c",
  authDomain: "fir-zen-25220.firebaseapp.com",
  databaseURL: "https://fir-zen-25220-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fir-zen-25220",
  storageBucket: "fir-zen-25220.firebasestorage.app",
  messagingSenderId: "1024387307221",
  appId: "1:1024387307221:web:82c408feb66c6b89d9f45c",
  measurementId: "G-XE384QH6PR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;