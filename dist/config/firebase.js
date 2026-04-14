"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyFirebaseIdToken = void 0;
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const httpError_1 = require("../utils/httpError");
const requiredEnvVars = [
    "FIREBASE_PROJECT_ID",
    "FIREBASE_CLIENT_EMAIL",
    "FIREBASE_PRIVATE_KEY",
];
const normalizePrivateKey = (value) => {
    // Supports both raw multiline keys and escaped "\\n" keys from hosted env providers.
    return value.replace(/\\n/g, "\n").replace(/^"|"$/g, "");
};
const getFirebaseCredential = () => {
    const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);
    if (missingEnvVars.length > 0) {
        throw new Error(`Missing Firebase configuration: ${missingEnvVars.join(", ")}`);
    }
    return (0, app_1.cert)({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
    });
};
const getFirebaseAuth = () => {
    if (!(0, app_1.getApps)().length) {
        (0, app_1.initializeApp)({
            credential: getFirebaseCredential(),
        });
    }
    return (0, auth_1.getAuth)();
};
const verifyFirebaseIdToken = async (idToken) => {
    if (!idToken) {
        throw (0, httpError_1.createHttpError)(400, "Firebase idToken is required");
    }
    try {
        return await getFirebaseAuth().verifyIdToken(idToken);
    }
    catch (error) {
        const authError = error;
        const code = authError.code || "";
        const message = authError.message || "Firebase token verification failed";
        if (code.startsWith("auth/") && (code.includes("invalid-id-token") ||
            code.includes("id-token-expired") ||
            code.includes("argument-error") ||
            code.includes("project-not-found"))) {
            throw (0, httpError_1.createHttpError)(401, "Invalid or expired Firebase token");
        }
        if (message.includes("Missing Firebase configuration")) {
            throw (0, httpError_1.createHttpError)(500, message);
        }
        throw (0, httpError_1.createHttpError)(500, "Firebase authentication is not configured correctly");
    }
};
exports.verifyFirebaseIdToken = verifyFirebaseIdToken;
