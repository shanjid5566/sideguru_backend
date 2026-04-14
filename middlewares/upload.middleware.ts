import { upload } from "../config/multer";

export const profileImageUpload = upload.single("profileImage");
export const categoryImageUpload = upload.single("image");
export const eventListingUpload = upload.fields([
	{ name: "mainImage", maxCount: 1 },
	{ name: "eventImage", maxCount: 1 },
	{ name: "eventImages", maxCount: 10 },
	{ name: "serviceImages", maxCount: 10 },
	{ name: "gallery", maxCount: 10 },
	{ name: "eventGallery", maxCount: 10 },
]);
export const serviceListingUpload = upload.fields([
	{ name: "mainImage", maxCount: 1 },
	{ name: "serviceImage", maxCount: 1 },
	{ name: "serviceImages", maxCount: 10 },
	{ name: "gallery", maxCount: 10 },
	{ name: "serviceGallery", maxCount: 10 },
]);
