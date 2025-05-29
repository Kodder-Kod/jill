import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth"; 
import { getAnalytics } from "firebase/analytics";


const firebaseConfig = {
  apiKey: "AIzaSyChsD96fctYhvBVmGIj7i6IiVghyv1Egto",
  authDomain: "chisend-web.firebaseapp.com",
  databaseURL: "https://chisend-web-default-rtdb.firebaseio.com",
  projectId: "chisend-web",
  storageBucket: "chisend-web.firebasestorage.app",
  messagingSenderId: "130545699425",
  appId: "1:130545699425:web:4e27a6989d025618877820",
  measurementId: "G-6WDRRV9P6R"
};


const app = initializeApp(firebaseConfig);

// Initialize Firebase services using the modular SDK
const db = getDatabase(app);

// Initialize Firebase Auth with React Native persistence
const auth = getAuth(app);

export { db, auth };


