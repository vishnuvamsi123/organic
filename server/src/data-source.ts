import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from './entity/User';
import { Farmer } from './entity/Farmer';
import { Product } from './entity/Product';
import { Order } from './entity/Order';
import { OrderItem } from './entity/OrderItem';
import { Review } from './entity/Review';
import { Coupon } from './entity/Coupon';
import { Payment } from './entity/Payment';
import { DeliveryPartner } from './entity/DeliveryPartner';

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...(process.env.DATABASE_URL
    ? { url: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST ?? 'localhost',
        port: Number(process.env.DB_PORT) ?? 5432,
        username: process.env.DB_USER ?? 'postgres',
        password: process.env.DB_PASSWORD ?? 'postgres',
        database: process.env.DB_NAME ?? 'organic',
      }),
  ssl: process.env.DATABASE_URL || (process.env.DB_HOST && process.env.DB_HOST !== 'localhost')
    ? { rejectUnauthorized: false }
    : false,
  synchronize: true, // set false in prod & use migrations
  logging: false,
  entities: [
    User,
    Farmer,
    Product,
    Order,
    OrderItem,
    Review,
    Coupon,
    Payment,
    DeliveryPartner,
  ],
});
