"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeToken = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getJwtSecret = () => {
    return process.env.JWT_SECRET || "development-secret";
};
const generateToken = (payload) => {
    const expiresIn = (process.env.JWT_EXPIRES_IN || "7d");
    return jsonwebtoken_1.default.sign(payload, getJwtSecret(), {
        expiresIn,
    });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, getJwtSecret());
    }
    catch {
        throw new Error("Invalid or expired token");
    }
};
exports.verifyToken = verifyToken;
const decodeToken = (token) => {
    return jsonwebtoken_1.default.decode(token);
};
exports.decodeToken = decodeToken;
