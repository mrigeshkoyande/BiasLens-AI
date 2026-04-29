/**
 * Production Build Configuration
 * This file is used to bake environment variables into the build
 * because .env files are currently ignored by the deployment upload.
 */

export const CONFIG = {
  NEXT_PUBLIC_API_URL: 'https://biaslens-backend-182763187357.us-central1.run.app/api',
  NEXT_PUBLIC_FIREBASE_API_KEY: 'AIzaSyAh-DID2zXdM3f2zJJ5T_MyOaJv4XBvKXk',
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'biaslens-dec70.firebaseapp.com',
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'biaslens-dec70',
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'biaslens-dec70.firebasestorage.app',
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '705497675386',
  NEXT_PUBLIC_FIREBASE_APP_ID: '1:705497675386:web:4d0debbd0c0d2872daadc3'
};
