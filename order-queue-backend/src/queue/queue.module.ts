import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { OrderProcessor } from './order.processor';
import { QueueGateway } from './queue.gateway';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'orders',
    }),
    forwardRef(() => OrdersModule),
  ],
  providers: [OrderProcessor, QueueGateway],
  exports: [QueueGateway],
})
export class QueueModule {}
