import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Order } from './Order';
import { IsEnum } from 'class-validator';

export type PaymentMethod = 'UPI' | 'COD';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Order, (order) => order.payments, { onDelete: 'CASCADE' })
  order!: Order;

  @Column({ type: 'enum', enum: ['UPI', 'COD'] })
  @IsEnum(['UPI', 'COD'])
  method!: PaymentMethod;

  @Column({ type: 'enum', enum: ['PENDING', 'SUCCESS', 'FAILED'] })
  @IsEnum(['PENDING', 'SUCCESS', 'FAILED'])
  status!: PaymentStatus;

  @Column({ nullable: true })
  transactionRef?: string; // e.g., UPI transaction id

  @CreateDateColumn()
  createdAt!: Date;
}
