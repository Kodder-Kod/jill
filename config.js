import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth"; 
import { getAnalytics } from "firebase/analytics";


const firebaseConfig = {
  apiKey: "AIzaSyCXSKNICI5QWdbOrnvaslPtBbDvgD_xfPs",
  authDomain: "chisendpos002.firebaseapp.com",
  databaseURL: "https://chisendpos002-default-rtdb.firebaseio.com",
  projectId: "chisendpos002",
  storageBucket: "chisendpos002.firebasestorage.app",
  messagingSenderId: "561580695206",
  appId: "1:561580695206:web:455def304dc95a699e9e67",
  measurementId: "G-PNPZHLVZY0"
};


const app = initializeApp(firebaseConfig);

// Initialize Firebase services using the modular SDK
const db = getDatabase(app);

// Initialize Firebase Auth with React Native persistence
const auth = getAuth(app);

export { db, auth };


