import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  async findAll() {
    return this.productsService.findAll();
  }

  @Post('reset')
  @UseGuards(JwtAuthGuard)
  async resetStock() {
    await this.productsService.resetStock();
    return { message: 'stock reset successfully' };
  }
}
