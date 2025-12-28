import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum ProductType {
  CHAIR = 'chair',
  TABLE = 'table',
}

@Schema({ timestamps: true })
export class Order {
  _id: Types.ObjectId;
  id: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true, enum: ProductType })
  productType: ProductType;

  @Prop({ required: true, default: 1 })
  quantity: number;

  @Prop({ required: true, enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Prop({ required: true })
  priority: number; // lower menas high priority (1 => vip, 5 => normal)

  @Prop({ default: false })
  isVip: boolean;

  @Prop()
  processingTime: number; // in seconds (chair => 10 seconds, table => 25 seconds)

  @Prop()
  estimatedWaitTime: number; 

  @Prop()
  jobId: string; // jobid for bullmq
}

export const OrderSchema = SchemaFactory.createForClass(Order);
