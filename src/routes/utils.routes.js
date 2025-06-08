import { Router } from "express"
import { processDocx, processPDF, chatWithGpt } from "../controllers/utils.controller.js"
import { validate } from "../middleware/validate.middleware.js"
import { processDocxSchema, processPDFSchema, chatGptSchema } from "../utils/constants.js"

const router = Router()

router.post("/process-temp-save-docx", validate(processDocxSchema), processDocx)
router.post("/pdf", validate(processPDFSchema), processPDF)
router.post("/chat-gpt", validate(chatGptSchema), chatWithGpt)
router.get("/gpt", (req, res) => {
    res.status(200).send("GPT route is working")
})

export default router
