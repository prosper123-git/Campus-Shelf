// Firebase App
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

// Firebase Authentication
import { getAuth } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

// Cloud Firestore
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAZur6B87Vhh5mcvdcrhtvFCzFttuiLClc",
  authDomain: "bushelf.firebaseapp.com",
  projectId: "bushelf",
  storageBucket: "bushelf.firebasestorage.app",
  messagingSenderId: "179743608969",
  appId: "1:179743608969:web:0d1b8364d6e304dc5db658",
  measurementId: "G-VW4Z03S2BM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
const auth = getAuth(app);
const db = getFirestore(app);

// Export Services
export { auth, db };