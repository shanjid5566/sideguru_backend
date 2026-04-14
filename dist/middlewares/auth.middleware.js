"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
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
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ success: false, error: "Unauthorized" });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({ success: false, error: "Forbidden" });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
