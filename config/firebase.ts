import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth, type DecodedIdToken } from "firebase-admin/auth";

const requiredEnvVars = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
] as const;

const getFirebaseCredential = () => {
  const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

  if (missingEnvVars.length > 0) {
    throw new Error(`Missing Firebase configuration: ${missingEnvVars.join(", ")}`);
  }

  return cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
  });
};

const getFirebaseAuth = () => {
  if (!getApps().length) {
    initializeApp({
      credential: getFirebaseCredential(),
    });
  }

  return getAuth();
};

export const verifyFirebaseIdToken = async (idToken: string): Promise<DecodedIdToken> => {
  if (!idToken) {
    throw new Error("Firebase idToken is required");
  }

  return getFirebaseAuth().verifyIdToken(idToken);
};
