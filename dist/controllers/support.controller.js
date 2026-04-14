"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const support_service_1 = __importDefault(require("../services/support.service"));
class SupportController {
    async submitContactMessage(req, res, next) {
        try {
            const result = await support_service_1.default.submitContactMessage(req.body);
            res.status(result.statusCode).json({
                success: true,
                message: result.message,
                data: result.data,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
const supportController = new SupportController();
exports.default = supportController;
