import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth"; 
import { getAnalytics } from "firebase/analytics";


const firebaseConfig = {
  apiKey: "AIzaSyDu6T2jQGf4BdL6w671gepKUXmw9kPptAg",
  authDomain: "chisendpos001-e1d15.firebaseapp.com",
  databaseURL: "https://chisendpos001-e1d15-default-rtdb.firebaseio.com",
  projectId: "chisendpos001-e1d15",
  storageBucket: "chisendpos001-e1d15.firebasestorage.app",
  messagingSenderId: "157206888742",
  appId: "1:157206888742:web:e770fcd98ded7c785581e7",
  measurementId: "G-132PDF1YCR"
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase services using the modular SDK
const db = getDatabase(app);

// Initialize Firebase Auth with React Native persistence
const auth = getAuth(app);

export { db, auth };


