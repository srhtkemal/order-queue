import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    return this.ordersService.create(
      createOrderDto,
      req.user.userId,
      req.user.username,
      req.user.isVip,
    );
  }

  @Get()
  async findMyOrders(@Request() req) {
    return this.ordersService.findByUser(req.user.userId);
  }

  @Get('queue')
  async getQueueState() {
    return this.ordersService.getQueueState();
  }

  @Get('wait-time')
  async getEstimatedWaitTime(@Request() req) {
    const waitTime = await this.ordersService.calculateEstimatedWaitTime(req.user.userId);
    return { estimatedWaitTime: waitTime };
  }
}
