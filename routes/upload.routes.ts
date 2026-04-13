import { Router } from "express";

import { uploadMedia } from "../controllers/upload.controller";
import { upload } from "../config/multer";

const uploadRouter = Router();

uploadRouter.post("/", upload.single("file"), uploadMedia);

export default uploadRouter;
