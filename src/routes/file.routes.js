import { Router } from "express"
import { uploadFile, getFile, updateFile, deleteFile } from "../controllers/file.controller.js"
import { validate } from "../middleware/validate.middleware.js"
import {
    uploadFileSchema,
    getFileSchema,
    updateFileSchema,
    deleteFileSchema,
} from "../utils/constants.js"

const router = Router()

router.post("/upload-file", validate(uploadFileSchema), uploadFile)
router.get("/get-file/:fileId", validate(getFileSchema, "params"), getFile)
router.post("/update-file", validate(updateFileSchema), updateFile)
router.delete("/delete-file", validate(deleteFileSchema), deleteFile)

export default router
