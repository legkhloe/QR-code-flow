
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { firebaseConfig } from "@/lib/config";

// Check for essential Firebase configuration *before* attempting to initialize
if (
  !firebaseConfig.apiKey ||
  !firebaseConfig.authDomain ||
  !firebaseConfig.projectId
) {
  const detailedErrorMessage =
    "Firebase configuration is missing or incomplete. " +
    "Please ensure all NEXT_PUBLIC_FIREBASE_ prefixed environment variables " +
    "(especially API_KEY, AUTH_DOMAIN, and PROJECT_ID) " +
    "are correctly set in your .env.local file. " +
    "Refer to the comments in src/lib/config.ts for the full list of expected environment variables.\n" +
    "Current values (may be undefined if not set):\n" +
    `  NEXT_PUBLIC_FIREBASE_API_KEY: ${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}\n` +
    `  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}\n` +
    `  NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`;

  console.error(detailedErrorMessage);

  // Throw a new error that will be caught by Next.js and displayed on the error overlay
  throw new Error(
    "Firebase initialization failed: Critical configuration is missing. " +
    "Check the browser console for detailed information and verify your .env.local file setup."
  );
}

// Initialize Firebase
// The getApps().length check ensures Firebase is only initialized once.
const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth: Auth = getAuth(app);

export { app, auth };
