import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { IsInt, Min, Max } from 'class-validator';

@Entity()
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  code!: string;

  @Column('int')
  @IsInt()
  @Min(1)
  @Max(100)
  discountPercent!: number; // e.g., 15 for 15% off

  @Column('float', { nullable: true })
  discountAmount?: number; // e.g., 100 for ₹100 flat discount

  @Column('int')
  maxUses!: number;

  @Column('int', { default: 0 })
  usedCount!: number;

  @Column({ type: 'timestamp' })
  expiresAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}
