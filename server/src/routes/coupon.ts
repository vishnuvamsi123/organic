// Coupon application route
import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth';
import { AppDataSource } from '../data-source';
import { Coupon } from '../entity/Coupon';

const router = Router();
router.use(authMiddleware);
router.use((req: Request, res: Response, next: NextFunction) => {
  // Only customers (users) can apply coupons
  if ((req as any).role !== 'user') {
    return res.status(403).json({ error: 'User access required' });
  }
  next();
});

/**
 * POST /api/v1/coupons/apply
 * body: { code: string }
 * Returns the discount amount (absolute) based on the coupon's percent.
 * The client is expected to know the order subtotal; we return the
 * percentage so it can compute the actual discount.
 */
router.post('/apply', async (req: Request, res: Response) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Coupon code required' });
  }

  const repo = AppDataSource.getRepository(Coupon);
  const coupon = await repo.findOne({ where: { code } });
  if (!coupon) {
    return res.status(404).json({ error: 'Coupon not found' });
  }

  // Validate expiry
  if (coupon.expiresAt && new Date() > coupon.expiresAt) {
    return res.status(400).json({ error: 'Coupon expired' });
  }

  // Validate usage limits
  if (coupon.usedCount >= coupon.maxUses) {
    return res.status(400).json({ error: 'Coupon usage limit reached' });
  }

  // Return discount percent and flat amount
  const discountPercent = coupon.discountPercent || 0;
  const discountAmount = coupon.discountAmount || 0;
  return res.json({ discountPercent, discountAmount });
});

export default router;
