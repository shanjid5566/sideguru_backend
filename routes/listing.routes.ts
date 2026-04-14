import { Router } from "express";

import listingController from "../controllers/listing.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { serviceListingUpload } from "../middlewares/upload.middleware";

const router = Router();

router.get("/admin", authenticate, authorize("ADMIN"), listingController.getAdminServices.bind(listingController));
router.get("/me", authenticate, listingController.getMyServices.bind(listingController));
router.get("/", listingController.getPublicServices.bind(listingController));
router.post("/", authenticate, serviceListingUpload, listingController.createService.bind(listingController));
router.put("/me/:id", authenticate, serviceListingUpload, listingController.updateService.bind(listingController));
router.delete("/me/:id", authenticate, listingController.deleteMyService.bind(listingController));
router.post("/:id/purchase", authenticate, listingController.createServicePaymentIntent.bind(listingController));
router.post("/:id/purchase/confirm", authenticate, listingController.confirmServiceListingPurchase.bind(listingController));
router.post("/:id/renew", authenticate, listingController.createServiceRenewalCheckoutSession.bind(listingController));
router.post("/:id/renew/confirm", authenticate, listingController.confirmServiceRenewal.bind(listingController));
router.post("/:id/report-spam", listingController.reportServiceSpam.bind(listingController));
router.patch("/:id/status", authenticate, authorize("ADMIN"), listingController.updateServiceStatus.bind(listingController));
router.delete("/:id", authenticate, authorize("ADMIN"), listingController.deleteService.bind(listingController));
router.get("/:id", listingController.getServiceById.bind(listingController));

export default router;
