import { Router } from 'express';
import { register, verifyUser } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { registerSchema, verifyUserSchema } from '../utils/constants.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/verify-user', validate(verifyUserSchema), verifyUser);

export default router;