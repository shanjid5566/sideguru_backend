import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth, type DecodedIdToken } from "firebase-admin/auth";
import { createHttpError } from "../utils/httpError";

const requiredEnvVars = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
] as const;

const normalizePrivateKey = (value: string): string => {
  // Supports both raw multiline keys and escaped "\\n" keys from hosted env providers.
  return value.replace(/\\n/g, "\n").replace(/^"|"$/g, "");
};

const getFirebaseCredential = () => {
  const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

  if (missingEnvVars.length > 0) {
    throw new Error(`Missing Firebase configuration: ${missingEnvVars.join(", ")}`);
  }

  return cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY!),
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
    throw createHttpError(400, "Firebase idToken is required");
  }

  try {
    return await getFirebaseAuth().verifyIdToken(idToken);
  } catch (error) {
    const authError = error as Error & { code?: string };
    const code = authError.code || "";
    const message = authError.message || "Firebase token verification failed";

    if (code.startsWith("auth/") && (
      code.includes("invalid-id-token") ||
      code.includes("id-token-expired") ||
      code.includes("argument-error") ||
      code.includes("project-not-found")
    )) {
      throw createHttpError(401, "Invalid or expired Firebase token");
    }

    if (message.includes("Missing Firebase configuration")) {
      throw createHttpError(500, message);
    }

    throw createHttpError(500, "Firebase authentication is not configured correctly");
  }
};
