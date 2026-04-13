"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwtUtils_1 = require("../utils/jwtUtils");
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
    }
    const token = authHeader.slice(7);
    try {
        req.user = (0, jwtUtils_1.verifyToken)(token);
        next();
    }
    catch {
        res.status(401).json({ success: false, error: "Invalid token" });
    }
};
exports.authenticate = authenticate;
