import { Router } from 'express';
import { processDocx, processPDF } from '../controllers/utils.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { processDocxSchema, processPDFSchema } from '../utils/constants.js';

const router = Router();

router.post('/process-temp-save-docx', validate(processDocxSchema), processDocx);
router.post('/pdf', validate(processPDFSchema), processPDF);

export default router;