// Entry point for the Organic backend server
import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { seedDatabase } from './seed';
import { json } from 'body-parser';

// Import routes (will be added later)
import authRouter from './routes/auth';
import productRouter from './routes/product';
import orderRouter from './routes/order';
import farmerRouter from './routes/farmer';
import paymentRouter from './routes/payment';
import reviewRouter from './routes/review';
import couponRouter from './routes/coupon';

const app = express();
app.use(cors());
app.use(json());

// Register routers
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/farmers', farmerRouter);
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/coupons', couponRouter);

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// Simple health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});
app.get("/", (req, res) => {
  res.send("Backend is running successfully 🚀");
});

// Export io for other modules (order notifications, etc.)
export { io };

import { AppDataSource } from './data-source';

AppDataSource.initialize()
  .then(async () => {
    await seedDatabase();
    const PORT = process.env.PORT || 4000;
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Data source initialization failed', err);
    process.exit(1);
  });
