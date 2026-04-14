import express from 'express';
import * as newsletterController from '../controllers/newsletterController.js';

const router = express.Router();

router.post('/subscribe', newsletterController.subscribeNewsletter);
router.post('/unsubscribe', newsletterController.unsubscribe);

// Admin only (assume authMiddleware+admin check elsewhere)
router.get('/', newsletterController.getSubscribers);
router.get('/count', newsletterController.getSubscriberCount);

export default router;
