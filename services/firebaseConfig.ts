import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB8ZA7rqDV3kjbfmQOMl4gjjgsSiR0qaNM",
  authDomain: "eunoia-96fe7.firebaseapp.com",
  projectId: "eunoia-96fe7",
  storageBucket: "eunoia-96fe7.firebasestorage.app",
  messagingSenderId: "223442980080",
  appId: "1:223442980080:web:d7c261d84f9c36198b0635",
  measurementId: "G-H89XJZE5NK"
};

let auth: Auth | null = null;
let db: Firestore | null = null;
let isMockMode = false;

try {
  // Prevent re-initialization if hot-reloading
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e: any) {
  // If we encounter the specific "auth not registered" error or others, fallback to mock mode
  console.warn("Firebase initialization issue detected. Switching to Mock Mode.", e.message);
  isMockMode = true;
}

export { auth, db, isMockMode };