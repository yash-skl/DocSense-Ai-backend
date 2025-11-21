import { Router } from "express";
import { upload } from "../middlewares/multer.middlewares.js";
import { checkPdf } from "../controllers/pdf.controllers.js";


const router = Router()

router.route("/check").post(upload.single('file'), checkPdf)

export default router