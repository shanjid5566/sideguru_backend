"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyFirebaseIdToken = void 0;
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const requiredEnvVars = [
    "FIREBASE_PROJECT_ID",
    "FIREBASE_CLIENT_EMAIL",
    "FIREBASE_PRIVATE_KEY",
];
const getFirebaseCredential = () => {
    const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);
    if (missingEnvVars.length > 0) {
        throw new Error(`Missing Firebase configuration: ${missingEnvVars.join(", ")}`);
    }
    return (0, app_1.cert)({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
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
        throw new Error("Firebase idToken is required");
    }
    return getFirebaseAuth().verifyIdToken(idToken);
};
exports.verifyFirebaseIdToken = verifyFirebaseIdToken;
