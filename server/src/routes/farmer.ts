import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth';
import { AppDataSource } from '../data-source';
import { Product } from '../entity/Product';
import { Order } from '../entity/Order';
import { io } from '../index';

const router = Router();

// Require farmer authentication
router.use(authMiddleware);
router.use((req: Request, res: Response, next: NextFunction) => {
  if ((req as any).role !== 'farmer') {
    return res.status(403).json({ error: 'Farmer access required' });
  }
  next();
});

/**
 * POST /api/v1/farmers/products
 * Create or update a product (upsert when id supplied)
 */
router.post('/products', async (req: Request, res: Response) => {
  const farmer = (req as any).principal;
  const { id, name, category, basePrice, unit, availableQty } = req.body;
  const repo = AppDataSource.getRepository(Product);
  let product: Product;
  if (id) {
    product = await repo.findOneOrFail({ where: { id } });
    product.name = name ?? product.name;
    product.category = category ?? product.category;
    product.basePrice = basePrice ?? product.basePrice;
    product.unit = unit ?? product.unit;
    product.availableQty = availableQty ?? product.availableQty;
  } else {
    product = repo.create({
      name,
      category,
      basePrice,
      unit,
      availableQty,
      farmer,
    });
  }
  await repo.save(product);
  res.json({ product });
});

/**
 * GET /api/v1/farmers/products
 * List all products belonging to the authenticated farmer
 */
router.get('/products', async (req: Request, res: Response) => {
  const farmer = (req as any).principal;
  const products = await AppDataSource.getRepository(Product).find({
    where: { farmer: { id: farmer.id } },
    order: { createdAt: 'DESC' },
  });
  res.json({ products });
});

/**
 * DELETE /api/v1/farmers/products/:id
 * Delete a product belonging to the farmer
 */
router.delete('/products/:id', async (req: Request, res: Response) => {
  const farmer = (req as any).principal;
  const repo = AppDataSource.getRepository(Product);
  const product = await repo.findOne({
    where: { id: req.params.id, farmer: { id: farmer.id } },
  });
  if (!product) return res.status(404).json({ error: 'Product not found' });
  await repo.remove(product);
  res.json({ success: true });
});

/**
 * GET /api/v1/farmers/orders
 * List orders awaiting farmer acceptance
 */
router.get('/orders', async (req: Request, res: Response) => {
  const farmer = (req as any).principal;
  const orders = await AppDataSource.getRepository(Order).find({
    where: { farmer: { id: farmer.id }, status: 'PLACED' },
    relations: ['user', 'items', 'items.product'],
  });
  res.json({ orders });
});

/**
 * POST /api/v1/farmers/orders/:orderId/accept
 * Farmer accepts an order, status moves to FARMER_ACCEPTED
 */
router.post('/orders/:orderId/accept', async (req: Request, res: Response) => {
  const farmer = (req as any).principal;
  const { orderId } = req.params;
  const orderRepo = AppDataSource.getRepository(Order);
  const order = await orderRepo.findOne({
    where: { id: orderId, farmer: { id: farmer.id } },
    relations: ['user'],
  });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.status !== 'PLACED')
    return res
      .status(400)
      .json({ error: `Cannot accept order in status ${order.status}` });
  order.status = 'FARMER_ACCEPTED';
  await orderRepo.save(order);
  // Notify customer via socket (room = user.id)
  io.to(order.user.id).emit('order:update', {
    orderId: order.id,
    status: order.status,
  });
  res.json({ order });
});

export default router;
