import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  Order,
  OrderDocument,
  OrderStatus,
  ProductType,
} from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { ProductsService } from '../products/products.service';
import { QueueGateway } from '../queue/queue.gateway';

@Injectable()
export class OrdersService implements OnModuleInit {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectQueue('orders') private ordersQueue: Queue,
    private productsService: ProductsService,
    private queueGateway: QueueGateway,
  ) {}

  onModuleInit() {
    this.queueGateway.setQueueStateProvider(() => this.getQueueState());
  }

  async create(
    createOrderDto: CreateOrderDto,
    userId: string,
    username: string,
    isVip: boolean,
  ): Promise<Order> {
    const product = await this.productsService.findByType(
      createOrderDto.productType,
    );
    if (!product || product.quantity < createOrderDto.quantity) {
      throw new BadRequestException('ınsufficient stock');
    }

    // atomic operation
    const reserved = await this.productsService.reserveStock(
      createOrderDto.productType,
      createOrderDto.quantity,
    );
    if (!reserved) {
      throw new BadRequestException('could not reserve stock');
    }

    const processingTime =
      createOrderDto.productType === ProductType.CHAIR ? 10 : 25;
    const priority = isVip ? 1 : 5;

    const order = new this.orderModel({
      userId: new Types.ObjectId(userId),
      username,
      productType: createOrderDto.productType,
      quantity: createOrderDto.quantity,
      status: OrderStatus.PENDING,
      priority,
      isVip,
      processingTime: processingTime * createOrderDto.quantity,
    });
    await order.save();

    const job = await this.ordersQueue.add(
      'process-order',
      {
        orderId: order._id.toString(),
        productType: createOrderDto.productType,
        quantity: createOrderDto.quantity,
        processingTime: processingTime * createOrderDto.quantity,
        username,
        isVip,
      },
      {
        priority,
        jobId: order._id.toString(),
      },
    );

    order.jobId = job.id || '';
    await order.save();

    await this.broadcastQueueState();
    await this.broadcastStockUpdate();

    return order;
  }

  async findByUser(userId: string): Promise<Order[]> {
    return this.orderModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 });
  }

  async findById(id: string): Promise<OrderDocument | null> {
    return this.orderModel.findById(id);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order | null> {
    const order = await this.orderModel.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );
    await this.broadcastQueueState();
    return order;
  }

  async getQueueState() {
    // For priority queues, jobs are in 'prioritized' state, not 'waiting'
    const waiting = await this.ordersQueue.getJobs([
      'waiting',
      'prioritized',
      'delayed',
    ]);
    const active = await this.ordersQueue.getActive();

    const waitingOrders = await Promise.all(
      waiting.map(async (job) => {
        const orderId = job.data.orderId;
        const order = await this.findById(orderId);
        return {
          jobId: job.id,
          orderId: orderId,
          username: job.data.username,
          productType: job.data.productType,
          quantity: job.data.quantity,
          processingTime: job.data.processingTime,
          isVip: job.data.isVip,
          priority: job.opts.priority || 5,
          status: order?.status,
        };
      }),
    );

    const activeOrders = await Promise.all(
      active.map(async (job) => {
        const orderId = job.data.orderId;
        const order = await this.findById(orderId);
        const progress = await job.progress;
        return {
          jobId: job.id,
          orderId: orderId,
          username: job.data.username,
          productType: job.data.productType,
          quantity: job.data.quantity,
          processingTime: job.data.processingTime,
          remainingTime: Math.max(
            0,
            job.data.processingTime -
              (typeof progress === 'number' ? progress : 0),
          ),
          isVip: job.data.isVip,
          priority: job.opts.priority || 5,
          status: order?.status,
        };
      }),
    );

    // vip first sortinf
    waitingOrders.sort((a, b) => (a.priority || 5) - (b.priority || 5));

    return {
      active: activeOrders,
      waiting: waitingOrders,
    };
  }

  async calculateEstimatedWaitTime(userId: string): Promise<number> {
    const queueState = await this.getQueueState();
    let totalWaitTime = 0;

    // active jobs cant be interrupted
    if (queueState.active.length > 0) {
      totalWaitTime += queueState.active[0].remainingTime || 0;
    }

    const userWaitingOrders = queueState.waiting.filter(
      (order) => order.orderId,
    );

    // calculate wait time for orders before user's orders
    const userOrders = await this.findByUser(userId);
    const userPendingOrderIds = userOrders
      .filter((o) => o.status === OrderStatus.PENDING)
      .map((o) => o._id.toString());

    for (const order of queueState.waiting) {
      if (userPendingOrderIds.includes(order.orderId)) {
        break;
      }
      totalWaitTime += order.processingTime;
    }

    return totalWaitTime;
  }

  async broadcastQueueState() {
    const queueState = await this.getQueueState();
    this.queueGateway.broadcastQueueUpdate(queueState);
  }

  async broadcastStockUpdate() {
    const products = await this.productsService.findAll();
    this.queueGateway.broadcastStockUpdate(products);
  }
}
