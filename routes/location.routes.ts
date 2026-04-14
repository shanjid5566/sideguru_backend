import { Router } from "express";

import locationController from "../controllers/location.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.get("/countries-with-regions", locationController.getCountriesWithRegions.bind(locationController));
router.get("/countries", locationController.getCountries.bind(locationController));
router.get("/countries/:countryId/regions", locationController.getRegionsByCountryId.bind(locationController));
router.post("/countries", authenticate, authorize("ADMIN"), locationController.createCountry.bind(locationController));
router.patch("/countries/:countryId", authenticate, authorize("ADMIN"), locationController.updateCountry.bind(locationController));
router.delete("/countries/:countryId", authenticate, authorize("ADMIN"), locationController.deleteCountry.bind(locationController));
router.post(
  "/countries/:countryId/regions",
  authenticate,
  authorize("ADMIN"),
  locationController.createRegion.bind(locationController),
);
router.patch(
  "/countries/:countryId/regions/:regionId",
  authenticate,
  authorize("ADMIN"),
  locationController.updateRegion.bind(locationController),
);
router.delete(
  "/countries/:countryId/regions/:regionId",
  authenticate,
  authorize("ADMIN"),
  locationController.deleteRegion.bind(locationController),
);

export default router;
