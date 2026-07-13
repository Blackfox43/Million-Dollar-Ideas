import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "silent-gist-m2t1j",
  appId: "1:664839441901:web:44f2823587298a7da6abe4",
  apiKey: "AIzaSyBxo3DSv8Y4OHBddO_1BCnJBOVOOofJsno",
  authDomain: "silent-gist-m2t1j.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-milliondollaride-49d84a8f-0b5c-4b4d-823a-39ba616c05b1",
  storageBucket: "silent-gist-m2t1j.firebasestorage.app",
  messagingSenderId: "664839441901"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Configure Google OAuth provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
