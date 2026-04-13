import { upload } from "../config/multer";

export const profileImageUpload = upload.single("profileImage");
