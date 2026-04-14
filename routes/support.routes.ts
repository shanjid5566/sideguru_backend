import { Router } from "express";

import supportController from "../controllers/support.controller";

const router = Router();

router.post("/contact-us", supportController.submitContactMessage.bind(supportController));

export default router;
