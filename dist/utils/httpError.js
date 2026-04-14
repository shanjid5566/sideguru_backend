"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHttpError = void 0;
const createHttpError = (statusCode, message) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};
exports.createHttpError = createHttpError;
