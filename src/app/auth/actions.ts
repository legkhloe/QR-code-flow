"use server";

import { AuthSchema, type AuthInput } from "@/lib/schemas";
import { प्रक्रियाOnBackendOnly_DangerouslyDoNotUseAnywhereElse as firebaseAdmin } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK (if not already initialized)
// This should ideally be done once in a centralized place, e.g., when the server starts.
// For Next.js server actions, this might re-initialize on each call if not handled carefully.
// However, Firebase Admin SDK is idempotent for initializeApp.
if (!firebaseAdmin.length) {
  // IMPORTANT: You need to set up Firebase Admin SDK credentials.
  // This typically involves setting the GOOGLE_APPLICATION_CREDENTIALS environment variable
  // to the path of your service account key JSON file.
  // Or, initialize with explicit credentials if running in an environment like Cloud Functions/Run.
  // For App Hosting, it might auto-initialize if configured correctly.
  try {
    firebaseAdmin({
      // If you have a service account JSON file, you can load it here:
      // credential: firebaseAdmin.cert(require('/path/to/your/serviceAccountKey.json')),
      // projectId: "your-project-id" // Ensure this matches your Firebase project
    });
  } catch (e) {
     console.warn(
        "Firebase Admin SDK not initialized. Authentication actions may fail. Ensure GOOGLE_APPLICATION_CREDENTIALS is set or initializeApp is called with credentials."
      );
  }
}


interface ActionResult {
  success: boolean;
  message: string;
  userId?: string;
}

// This is a placeholder for server-side sign-in logic.
// Firebase client SDK is typically used for sign-in as it handles token management.
// For server-side operations like creating custom tokens or managing users, Admin SDK is used.
// For actual sign-in, you'd typically rely on the client SDK, and server actions would be
// more for things like creating user records in your DB after client-side signup.
// However, to demonstrate a server action for "login", we'll simulate validation.
// For a real app, Firebase client SDK's signInWithEmailAndPassword is the standard.
export async function signInAction(data: AuthInput): Promise<ActionResult> {
  const validation = AuthSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, message: "Invalid input." };
  }

  // In a real scenario, sign-in is handled by Firebase client SDK.
  // This server action is mostly a placeholder.
  // You might use Admin SDK to verify a token sent from client after successful client-side login.
  // For now, we'll just return a success message.
  // To actually sign in, you'd use Firebase client SDK on the client.
  // This action simulates a "check" if a user exists, but doesn't perform actual login.
  try {
     if (!firebaseAdmin.length) {
      throw new Error("Firebase Admin SDK not initialized.");
    }
    const adminAuth = getAdminAuth();
    const userRecord = await adminAuth.getUserByEmail(validation.data.email);
    // Password check is NOT done here with Admin SDK for security reasons.
    // Client SDK handles password verification during its signInWithEmailAndPassword.
    return { success: true, message: "User exists (password not checked by server action). Client SDK handles login.", userId: userRecord.uid };
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      return { success: false, message: "User not found." };
    }
    console.error("Sign-in action error:", error);
    return { success: false, message: error.message || "Sign-in failed." };
  }
}


export async function signUpAction(data: AuthInput): Promise<ActionResult> {
  const validation = AuthSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, message: "Invalid input." };
  }

  try {
     if (!firebaseAdmin.length) {
      throw new Error("Firebase Admin SDK not initialized.");
    }
    const adminAuth = getAdminAuth();
    const userRecord = await adminAuth.createUser({
      email: validation.data.email,
      password: validation.data.password,
      emailVerified: false, // Optional: set to true if you have an email verification flow
      disabled: false,
    });
    return { success: true, message: "Sign-up successful! Please log in.", userId: userRecord.uid };
  } catch (error: any) {
     if (error.code === 'auth/email-already-exists') {
      return { success: false, message: "Email already in use." };
    }
    console.error("Sign-up action error:", error);
    return { success: false, message: error.message || "Sign-up failed. Please try again." };
  }
}
