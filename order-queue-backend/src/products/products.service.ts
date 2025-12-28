import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';

@Injectable()
export class ProductsService implements OnModuleInit {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async onModuleInit() {

    await this.initializeProducts();
    // reset stock on every startup for testing if you don't want, comment line below
    await this.resetStock();
  }

  private async initializeProducts() {
    const chairExists = await this.productModel.findOne({ type: 'chair' });
    if (!chairExists) {
      await this.productModel.create({
        type: 'chair',
        name: 'Chair',
        quantity: 20,
        processingTimePerUnit: 10,
      });
    }

    const tableExists = await this.productModel.findOne({ type: 'table' });
    if (!tableExists) {
      await this.productModel.create({
        type: 'table',
        name: 'Table',
        quantity: 5,
        processingTimePerUnit: 25,
      });
    }
  }

  async findAll(): Promise<Product[]> {
    return this.productModel.find();
  }

  async findByType(type: string): Promise<ProductDocument | null> {
    return this.productModel.findOne({ type });
  }

  async reserveStock(type: string, quantity: number): Promise<boolean> {
    // atomic update , only succeeds if there's enough stock
    const result = await this.productModel.findOneAndUpdate(
      { type, quantity: { $gte: quantity } },
      { $inc: { quantity: -quantity } },
      { new: true },
    );
    return result !== null;
  }

  async releaseStock(type: string, quantity: number): Promise<void> {
    await this.productModel.findOneAndUpdate(
      { type },
      { $inc: { quantity: quantity } },
    );
  }

  async resetStock(): Promise<void> {
    await this.productModel.updateOne({ type: 'chair' }, { quantity: 20 });
    await this.productModel.updateOne({ type: 'table' }, { quantity: 5 });
  }
}
