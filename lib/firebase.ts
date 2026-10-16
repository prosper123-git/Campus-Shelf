import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAZur6B87Vhh5mcvdcrhtvFCzFttuiLClc",
  authDomain: "bushelf.firebaseapp.com",
  projectId: "bushelf",
  storageBucket: "bushelf.firebasestorage.app",
  messagingSenderId: "179743608969",
  appId: "1:179743608969:web:0d1b8364d6e304dc5db658",
  measurementId: "G-VW4Z03S2BM",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
