import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Farmer } from './Farmer';
import { IsEnum, IsNumber, IsString } from 'class-validator';

export type Category = 'vegetable' | 'fruit' | 'rice' | 'pulse' | 'dairy';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  @IsString()
  name!: string;

  @Column({ type: 'enum', enum: ['vegetable', 'fruit', 'rice', 'pulse', 'dairy'] })
  @IsEnum(['vegetable', 'fruit', 'rice', 'pulse', 'dairy'])
  category!: Category;

  @Column('float')
  @IsNumber()
  basePrice!: number; // base price before region/demand adjustments

  @Column()
  unit!: string; // e.g., "kg", "piece"

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column('int')
  @IsNumber()
  availableQty!: number;

  @ManyToOne(() => Farmer, (farmer) => farmer.products, { onDelete: 'CASCADE' })
  farmer!: Farmer;

  @CreateDateColumn()
  createdAt!: Date;
}
