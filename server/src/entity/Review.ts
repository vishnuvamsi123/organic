import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from './User';
import { Farmer } from './Farmer';
import { Product } from './Product';
import { IsInt, Min, Max } from 'class-validator';

@Entity()
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.id, { nullable: false })
  user!: User;

  // Either a farmer or a product can be reviewed (both optional, at least one must be set)
  @ManyToOne(() => Farmer, (farmer) => farmer.id, { nullable: true })
  farmer?: Farmer;

  @ManyToOne(() => Product, (product) => product.id, { nullable: true })
  product?: Product;

  @Column('int')
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
