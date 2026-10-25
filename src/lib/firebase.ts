import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  Auth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = (): boolean => {
  const key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const project = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  return Boolean(
    key &&
      project &&
      !key.includes("your_firebase") &&
      !project.includes("your_firebase") &&
      key.trim().length > 10
  );
};

// Initialize Firebase singleton safely
let app: FirebaseApp | undefined;
let auth: Auth | undefined;

export const getFirebaseAuth = (): Auth | null => {
  if (typeof window === "undefined") return null;
  if (auth) return auth;

  try {
    if (isFirebaseConfigured()) {
      app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      auth = getAuth(app);
      return auth;
    }
  } catch (error) {
    console.warn("Firebase initialization notice:", error);
  }
  return null;
};

// Initialize on client load if configured
if (typeof window !== "undefined") {
  getFirebaseAuth();
}

export { app, auth };

/**
 * Creates and initializes an invisible or normal reCAPTCHA verifier for phone auth.
 */
export const setupRecaptchaVerifier = (
  containerId: string,
  callback?: () => void
): RecaptchaVerifier | null => {
  if (typeof window === "undefined") return null;

  const currentAuth = getFirebaseAuth();
  if (!currentAuth) return null;

  try {
    // Clear any existing verifier instance attached to window
    if ((window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier.clear();
      } catch (e) {
        console.warn("Cleared existing recaptcha verifier", e);
      }
    }

    const verifier = new RecaptchaVerifier(currentAuth, containerId, {
      size: "invisible",
      callback: () => {
        if (callback) callback();
      },
      "expired-callback": () => {
        console.warn("reCAPTCHA expired. Please retry.");
      },
    });

    (window as any).recaptchaVerifier = verifier;
    return verifier;
  } catch (error) {
    console.error("Failed to setup reCAPTCHA verifier:", error);
    return null;
  }
};

/**
 * Sends OTP to the provided phone number.
 * Supports standard Firebase confirmation and demo fallback for quick testing.
 */
export const sendOtpToPhone = async (
  phoneNumber: string,
  verifier: RecaptchaVerifier | null
): Promise<{
  confirmationResult?: ConfirmationResult;
  isDemo?: boolean;
  demoCode?: string;
}> => {
  const currentAuth = getFirebaseAuth();

  // If Firebase keys are placeholders or testing with special demo number
  if (!isFirebaseConfigured() || !currentAuth || phoneNumber.includes("9999999999")) {
    console.info(
      "ZURIQ FASHION Phone Auth: Running in Demo Mode (Mock OTP is 123456)"
    );
    return {
      isDemo: true,
      demoCode: "123456",
    };
  }

  if (!verifier) {
    throw new Error(
      "reCAPTCHA verification not initialized. Please reload the page."
    );
  }

  const confirmationResult = await signInWithPhoneNumber(
    currentAuth,
    phoneNumber,
    verifier
  );
  return { confirmationResult, isDemo: false };
};

/**
 * Verifies OTP code against Firebase or demo fallback
 */
export const verifyOtpCode = async (
  confirmationResult: ConfirmationResult | undefined,
  code: string,
  isDemo?: boolean
): Promise<{ success: boolean; user?: any }> => {
  if (isDemo || !confirmationResult) {
    if (code === "123456") {
      return { success: true, user: { phoneNumber: "demo" } };
    } else {
      throw new Error("Invalid verification code. For test mode, use code: 123456");
    }
  }

  const result = await confirmationResult.confirm(code);
  return { success: true, user: result.user };
};
