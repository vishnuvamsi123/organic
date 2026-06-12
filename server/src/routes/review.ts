import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth';
import { AppDataSource } from '../data-source';
import { Review } from '../entity/Review';
import { User } from '../entity/User';
import { Farmer } from '../entity/Farmer';
import { Product } from '../entity/Product';

const router = Router();
router.use(authMiddleware);
router.use((req: Request, res: Response, next: NextFunction) => {
  if ((req as any).role !== 'user') {
    return res.status(403).json({ error: 'User access required' });
  }
  next();
});

/**
 * POST /api/v1/reviews
 * body: { farmerId?, productId?, rating:1-5, comment? }
 */
router.post('/', async (req: Request, res: Response) => {
  const user = (req as any).principal as User;
  const { farmerId, productId, rating, comment } = req.body;
  if (!farmerId && !productId) {
    return res
      .status(400)
      .json({ error: 'Either farmerId or productId must be provided' });
  }
  const review = new Review();
  review.user = user;
  review.rating = rating;
  review.comment = comment;

  if (farmerId) {
    const farmer = await AppDataSource.getRepository(Farmer).findOneOrFail({
      where: { id: farmerId },
    });
    review.farmer = farmer;
  }
  if (productId) {
    const product = await AppDataSource.getRepository(Product).findOneOrFail({
      where: { id: productId },
    });
    review.product = product;
  }

  await AppDataSource.getRepository(Review).save(review);
  res.json({ review });
});

export default router;
