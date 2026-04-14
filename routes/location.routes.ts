import { Router } from "express";

import locationController from "../controllers/location.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.get("/countries-with-regions", locationController.getCountriesWithRegions.bind(locationController));
router.get("/countries", locationController.getCountries.bind(locationController));
router.get("/countries/:countryId/regions", locationController.getRegionsByCountryId.bind(locationController));
router.post("/countries", authenticate, authorize("ADMIN"), locationController.createCountry.bind(locationController));
router.post(
  "/countries/:countryId/regions",
  authenticate,
  authorize("ADMIN"),
  locationController.createRegion.bind(locationController),
);

export default router;
