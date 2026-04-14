"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const location_controller_1 = __importDefault(require("../controllers/location.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get("/countries-with-regions", location_controller_1.default.getCountriesWithRegions.bind(location_controller_1.default));
router.get("/countries", location_controller_1.default.getCountries.bind(location_controller_1.default));
router.get("/countries/:countryId/regions", location_controller_1.default.getRegionsByCountryId.bind(location_controller_1.default));
router.post("/countries", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), location_controller_1.default.createCountry.bind(location_controller_1.default));
router.patch("/countries/:countryId", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), location_controller_1.default.updateCountry.bind(location_controller_1.default));
router.delete("/countries/:countryId", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), location_controller_1.default.deleteCountry.bind(location_controller_1.default));
router.post("/countries/:countryId/regions", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), location_controller_1.default.createRegion.bind(location_controller_1.default));
router.patch("/countries/:countryId/regions/:regionId", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), location_controller_1.default.updateRegion.bind(location_controller_1.default));
router.delete("/countries/:countryId/regions/:regionId", auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)("ADMIN"), location_controller_1.default.deleteRegion.bind(location_controller_1.default));
exports.default = router;
