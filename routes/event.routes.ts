import { Router } from "express";

import eventController from "../controllers/event.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { eventListingUpload } from "../middlewares/upload.middleware";

const router = Router();

router.get("/admin", authenticate, authorize("ADMIN"), eventController.getAdminEvents.bind(eventController));
router.get("/me", authenticate, eventController.getMyEvents.bind(eventController));
router.get("/", eventController.getPublicEvents.bind(eventController));
router.post("/", authenticate, eventListingUpload, eventController.createEvent.bind(eventController));
router.put("/me/:id", authenticate, eventListingUpload, eventController.updateEvent.bind(eventController));
router.delete("/me/:id", authenticate, eventController.deleteMyEvent.bind(eventController));
router.post("/:id/purchase", authenticate, eventController.createEventPaymentIntent.bind(eventController));
router.post("/:id/purchase/confirm", authenticate, eventController.confirmEventListingPurchase.bind(eventController));
router.post("/:id/renew", authenticate, eventController.createEventRenewalCheckoutSession.bind(eventController));
router.post("/:id/renew/confirm", authenticate, eventController.confirmEventRenewal.bind(eventController));
router.post("/:id/report-spam", eventController.reportEventSpam.bind(eventController));
router.patch("/:id/status", authenticate, authorize("ADMIN"), eventController.updateEventStatus.bind(eventController));
router.delete("/:id", authenticate, authorize("ADMIN"), eventController.deleteEvent.bind(eventController));
router.get("/:id", eventController.getEventById.bind(eventController));

export default router;
