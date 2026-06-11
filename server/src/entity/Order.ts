import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { User } from './User';
import { Farmer } from './Farmer';
import { DeliveryPartner } from './DeliveryPartner';
import { OrderItem } from './OrderItem';
import { Payment } from './Payment';

export type OrderStatus =
  | 'PLACED'
  | 'FARMER_ACCEPTED'
  | 'PARTNER_ASSIGNED'
  | 'DISPATCHED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  user!: User;

  @ManyToOne(() => Farmer, (farmer) => farmer.id, { nullable: false })
  farmer!: Farmer;

  @ManyToOne(() => DeliveryPartner, (dp) => dp.id, { nullable: true })
  deliveryPartner?: DeliveryPartner;

  @Column({
    type: 'enum',
    enum: [
      'PLACED',
      'FARMER_ACCEPTED',
      'PARTNER_ASSIGNED',
      'DISPATCHED',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
    ],
  })
  status!: OrderStatus;

  @Column('float')
  total!: number;

  @Column('float')
  lat!: number;
  @Column('float')
  lon!: number;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items!: OrderItem[];

  @OneToMany(() => Payment, (p) => p.order, { cascade: true })
  payments!: Payment[];

  @CreateDateColumn()
  createdAt!: Date;
}
