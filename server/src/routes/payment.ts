import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth';
import { AppDataSource } from '../data-source';
import { Order } from '../entity/Order';
import { Payment } from '../entity/Payment';

const router = Router();
router.use(authMiddleware);
router.use((req: Request, res: Response, next: NextFunction) => {
  if ((req as any).role !== 'user') {
    return res.status(403).json({ error: 'User access required' });
  }
  next();
});

/**
 * POST /api/v1/payments/:orderId/upi
 * Returns a UPI deep‑link URI for the order amount.
 */
router.post('/:orderId/upi', async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const order = await AppDataSource.getRepository(Order).findOneOrFail({
    where: { id: orderId },
  });

  const upiId = process.env.UPI_MERCHANT_ID ?? 'organicmerchant@upi';
  const deepLink = `upi://pay?pa=${upiId}&pn=Organic&am=${order.total}&cu=INR&tn=Order%23${order.id}`;

  const payment = new Payment();
  payment.order = order;
  payment.method = 'UPI';
  payment.status = 'PENDING';
  await AppDataSource.getRepository(Payment).save(payment);

  res.json({ deepLink, paymentId: payment.id });
});

/**
 * POST /api/v1/payments/:orderId/cod
 * Marks the payment method as Cash‑on‑Delivery.
 */
router.post('/:orderId/cod', async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const order = await AppDataSource.getRepository(Order).findOneOrFail({
    where: { id: orderId },
  });

  const payment = new Payment();
  payment.order = order;
  payment.method = 'COD';
  payment.status = 'PENDING';
  await AppDataSource.getRepository(Payment).save(payment);

  res.json({ message: 'COD selected', paymentId: payment.id });
});

export default router;
