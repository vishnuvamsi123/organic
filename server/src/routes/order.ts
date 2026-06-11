import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { AppDataSource } from '../data-source';
import { Order } from '../entity/Order';
import { OrderItem } from '../entity/OrderItem';
import { Product } from '../entity/Product';
import { Coupon } from '../entity/Coupon';
import { io } from '../index';

const router = Router();
router.use(authMiddleware);


/**
 * POST /api/v1/orders
 * body: { lat, lon, items: [{ productId, qty }] }
 */
router.post('/', async (req: Request, res: Response) => {
  if ((req as any).role !== 'user') {
    return res.status(403).json({ error: 'Only customers can place orders' });
  }
  // Optional coupon code support
  const { couponCode } = req.body as any;
  let discountAmount = 0;
  let discountPercent = 0;
  let flatDiscount = 0;
  if (couponCode) {
    // Validate coupon similar to /coupons/apply
    const couponRepo = AppDataSource.getRepository(Coupon);
    const coupon = await couponRepo.findOne({ where: { code: couponCode } });
    if (!coupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return res.status(400).json({ error: 'Coupon expired' });
    }
    if (coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ error: 'Coupon usage limit reached' });
    }
    // Increment usage count now (optimistic)
    coupon.usedCount += 1;
    await couponRepo.save(coupon);
    discountPercent = coupon.discountPercent || 0;
    flatDiscount = coupon.discountAmount || 0;
  }
  const user = (req as any).principal;
  const { lat, lon, items } = req.body;

  if (!lat || !lon || !Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({ error: 'lat, lon, and at least one item required' });
  }

  const productRepo = AppDataSource.getRepository(Product);
  const orderItems: OrderItem[] = [];
  let total = 0;
  let farmerId: string | undefined;

  for (const { productId, qty } of items) {
    let product;
    try {
      product = await productRepo.findOne({
        where: { id: productId },
        relations: ['farmer'],
      });
    } catch (err) {
      return res
        .status(400)
        .json({ error: `Invalid product ID format: ${productId}` });
    }

    if (!product) {
      return res
        .status(404)
        .json({ error: `Product not found: ${productId}` });
    }

    if (product.availableQty < qty) {
      return res
        .status(400)
        .json({ error: `Insufficient stock for ${product.name}` });
    }

    farmerId = farmerId ?? product.farmer.id;

    const price = product.basePrice; // placeholder for dynamic pricing
    total += price * qty;
    orderItems.push(
      Object.assign(new OrderItem(), {
        product,
        qty,
        priceAtOrder: price,
      })
    );
  }

  const orderRepo = AppDataSource.getRepository(Order);
  // Apply coupon discount if present
  if (flatDiscount > 0) {
    discountAmount = flatDiscount;
  } else if (discountPercent > 0) {
    discountAmount = (total * discountPercent) / 100;
  }
  // Ensure discount does not exceed total
  if (discountAmount > total) discountAmount = total;
  total = total - discountAmount;
  const order = orderRepo.create({
    user,
    farmer: { id: farmerId! } as any,
    status: 'PLACED',
    total,
    lat,
    lon,
    items: orderItems,
  });

  await orderRepo.save(order);
      // If a coupon was applied, total already reflects discount.


  // Notify farmer via socket (room = farmer.id)
  io.to(order.farmer.id).emit('order:new', {
    orderId: order.id,
    total,
  });

  res.json({ orderId: order.id, status: order.status, total });
});

/**
 * GET /api/v1/orders/:orderId/status
 * Returns current order status (and optional location fields)
 */
router.get('/:orderId/status', async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const order = await AppDataSource.getRepository(Order).findOne({
    where: { id: orderId },
    relations: ['deliveryPartner'],
  });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json({
    orderId: order.id,
    status: order.status,
    lat: (order as any).lat,
    lon: (order as any).lon,
  });
});

/**
 * GET /api/v1/orders
 * Returns all orders for the authenticated user
 */
router.get('/', async (req: Request, res: Response) => {
  if ((req as any).role !== 'user') {
    return res.status(403).json({ error: 'Only customers can view order history' });
  }
  const user = (req as any).principal;
  const orders = await AppDataSource.getRepository(Order).find({
    where: { user: { id: user.id } },
    relations: ['items', 'items.product', 'farmer'],
    order: { createdAt: 'DESC' },
  });
  res.json({ orders });
});

/**
 * PATCH /api/v1/orders/:orderId/status
 * Allows a farmer to update order status
 * Body: { status: 'CONFIRMED' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED' }
 */
router.patch('/:orderId/status', async (req: Request, res: Response) => {
  // Only farmers can update status
  if ((req as any).role !== 'farmer' && (req as any).role !== 'user') {
    return res.status(403).json({ error: 'Access denied' });
  }
  const { orderId } = req.params;
  const { status } = req.body;
  const validStatuses = ['CONFIRMED', 'DISPATCHED', 'DELIVERED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status', valid: validStatuses });
  }
  const repo = AppDataSource.getRepository(Order);
  const order = await repo.findOne({ where: { id: orderId } });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  (order as any).status = status;
  await repo.save(order);

  // Notify user via socket (room = user ID)
  io.to((order as any).user?.id ?? '').emit('order:status', { orderId, status });

  res.json({ orderId, status });
});

export default router;
