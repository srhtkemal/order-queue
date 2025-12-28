import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { forwardRef, Inject, Logger } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { OrderStatus } from '../orders/schemas/order.schema';
import { QueueGateway } from './queue.gateway';

@Processor('orders', { concurrency: 1 })
export class OrderProcessor extends WorkerHost {
  private readonly logger = new Logger(OrderProcessor.name);

  constructor(
    @Inject(forwardRef(() => OrdersService))
    private ordersService: OrdersService,
    private queueGateway: QueueGateway,
  ) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    const { orderId, processingTime, username, productType, isVip } = job.data;

    this.logger.log(
      `Processing order ${orderId} for ${username} - ${productType} (${processingTime}s)`,
    );

    // order status => processing
    await this.ordersService.updateStatus(orderId, OrderStatus.PROCESSING);


    const totalTime = processingTime;
    const intervalTime = 1000; // updates every second
    let elapsed = 0;

    while (elapsed < totalTime) {
      await this.delay(intervalTime);
      elapsed += 1;
      await job.updateProgress(elapsed);


      this.queueGateway.broadcastProcessingProgress({
        orderId,
        username,
        productType,
        isVip,
        totalTime,
        elapsed,
        remainingTime: totalTime - elapsed,
      });
    }


    await this.ordersService.updateStatus(orderId, OrderStatus.COMPLETED);

    // notify the specific user that their order is complete
    this.queueGateway.broadcastOrderComplete({
      orderId,
      username,
      productType,
    });

    this.logger.log(`order ${orderId} completed`);

    return { success: true };
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed`);
    this.ordersService.broadcastQueueState();
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed: ${error.message}`);
    await this.ordersService.updateStatus(job.data.orderId, OrderStatus.FAILED);
    this.ordersService.broadcastQueueState();
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
