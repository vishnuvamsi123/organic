import { Router, Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Product } from '../entity/Product';

const router = Router();

/**
 * GET /api/v1/products
 * Query: lat, lon (required), category (comma‑separated list)
 */
router.get('/', async (req: Request, res: Response) => {
  const { lat, lon, category } = req.query as any;
  if (!lat || !lon) {
    return res
      .status(400)
      .json({ error: 'lat and lon query parameters are required' });
  }

  const categories = category
    ? (category as string).split(',').map((c) => c.trim())
    : undefined;

  const radius = 0.5; // approx 55 km in degrees
  const latNum = Number(lat);
  const lonNum = Number(lon);
  const latMin = latNum - radius;
  const latMax = latNum + radius;
  const lonMin = lonNum - radius;
  const lonMax = lonNum + radius;

  const repo = AppDataSource.getRepository(Product);
  const qb = repo
    .createQueryBuilder('product')
    .innerJoinAndSelect('product.farmer', 'farmer')
    .where('farmer.lat BETWEEN :latMin AND :latMax', { latMin, latMax })
    .andWhere('farmer.lon BETWEEN :lonMin AND :lonMax', { lonMin, lonMax });

  if (categories?.length) {
    qb.andWhere('product.category IN (:...cats)', { cats: categories });
  }

  let products = await qb.getMany();

  // If no products found within local radius, fallback to all products so the user is never shown a blank screen
  if (products.length === 0) {
    const fallbackQb = repo
      .createQueryBuilder('product')
      .innerJoinAndSelect('product.farmer', 'farmer');
    if (categories?.length) {
      fallbackQb.andWhere('product.category IN (:...cats)', { cats: categories });
    }
    products = await fallbackQb.getMany();
  }

  res.json({ products });
});

/**
 * GET /api/v1/products/:id
 * Returns a single product by ID with farmer relation
 */
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const repo = AppDataSource.getRepository(Product);
  const product = await repo.findOne({
    where: { id },
    relations: ['farmer'],
  });
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ product });
});

export default router;
