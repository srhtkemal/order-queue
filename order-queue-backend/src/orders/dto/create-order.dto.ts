import { IsEnum, IsNumber, Min } from 'class-validator';
import { ProductType } from '../schemas/order.schema';

export class CreateOrderDto {
  @IsEnum(ProductType)
  productType: ProductType;

  @IsNumber()
  @Min(1)
  quantity: number;
}
