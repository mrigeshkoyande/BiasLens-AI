import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth, GoogleAuthProvider } from "firebase/auth";
import { CONFIG } from "./config";

const firebaseConfig = {
  apiKey: CONFIG.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: CONFIG.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: CONFIG.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: CONFIG.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: CONFIG.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: CONFIG.NEXT_PUBLIC_FIREBASE_APP_ID
};

let app: FirebaseApp | undefined;
let auth: Auth;
const googleProvider = new GoogleAuthProvider();

// Check if we have the minimal config to avoid build-time crashes
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "undefined") {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
} else {
  // Mock auth for build-time static generation
  console.warn("Firebase API Key missing. Using mock auth for build.");
  auth = {
    currentUser: null,
    onAuthStateChanged: (cb: any) => {
      // Return a dummy unsubscribe function
      return () => {};
    },
    // Add other methods as needed to avoid runtime errors during build/prerender
  } as unknown as Auth;
}

export { auth, googleProvider };
