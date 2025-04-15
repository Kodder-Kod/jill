import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth"; 
import { getAnalytics } from "firebase/analytics";


const firebaseConfig = {
  apiKey: "AIzaSyD9XwVVC_yVh8rTlEuZtRKJfoGZSSrASm8",
  authDomain: "chisend-pos-001.firebaseapp.com",
  databaseURL: "https://chisend-pos-001-default-rtdb.firebaseio.com",
  projectId: "chisend-pos-001",
  storageBucket: "chisend-pos-001.firebasestorage.app",
  messagingSenderId: "67380890641",
  appId: "1:67380890641:web:760aeced15e9a26da5f5b0",
  measurementId: "G-9WX80ERW5B"
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase services using the modular SDK
const db = getDatabase(app);

// Initialize Firebase Auth with React Native persistence
const auth = getAuth(app);

export { db, auth };


