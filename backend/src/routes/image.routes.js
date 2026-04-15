import { Router } from 'express';

import { generateImage } from '../controllers/image.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(requireAuth);
router.post('/threads/:threadId/generate', generateImage);

export default router;
