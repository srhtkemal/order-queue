import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, unique: true })
  type: string; // chair , table

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, default: 0 })
  quantity: number;

  @Prop({ required: true })
  processingTimePerUnit: number; 
}

export const ProductSchema = SchemaFactory.createForClass(Product);
