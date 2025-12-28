import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  },
})
export class QueueGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(QueueGateway.name);
  private currentQueueState: any = { active: [], waiting: [] };
  private getQueueStateFn: (() => Promise<any>) | null = null;

  setQueueStateProvider(fn: () => Promise<any>) {
    this.getQueueStateFn = fn;
  }

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    // send current queue state to newly connected client
    if (this.getQueueStateFn) {
      try {
        const freshState = await this.getQueueStateFn();
        this.currentQueueState = freshState;
        client.emit('queueUpdate', freshState);
        this.logger.log(`Sent fresh queue state to client: ${JSON.stringify(freshState)}`);
      } catch (error) {
        this.logger.error('Failed to get queue state', error);
        client.emit('queueUpdate', this.currentQueueState);
      }
    } else {
      client.emit('queueUpdate', this.currentQueueState);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(client: Socket, username: string) {
    client.join(username);
    this.logger.log(`${username} joined their room`);
    // send current queue state to user
    if (this.getQueueStateFn) {
      try {
        const freshState = await this.getQueueStateFn();
        this.currentQueueState = freshState;
        client.emit('queueUpdate', freshState);
      } catch (error) {
        client.emit('queueUpdate', this.currentQueueState);
      }
    } else {
      client.emit('queueUpdate', this.currentQueueState);
    }
  }

  @SubscribeMessage('getQueueState')
  async handleGetQueueState(client: Socket) {
    this.logger.log(`Client ${client.id} requested queue state`);
    if (this.getQueueStateFn) {
      try {
        const freshState = await this.getQueueStateFn();
        this.currentQueueState = freshState;
        client.emit('queueUpdate', freshState);
      } catch (error) {
        client.emit('queueUpdate', this.currentQueueState);
      }
    } else {
      client.emit('queueUpdate', this.currentQueueState);
    }
  }

  broadcastQueueUpdate(queueState: any) {
    this.currentQueueState = queueState;
    this.server.emit('queueUpdate', queueState);
  }

  broadcastStockUpdate(products: any[]) {
    this.server.emit('stockUpdate', products);
  }

  broadcastProcessingProgress(progress: any) {
    this.server.emit('processingProgress', progress);
  }

  broadcastOrderComplete(data: { orderId: string; username: string; productType: string }) {
    // broadcast to everyone
    this.server.emit('orderComplete', data);
    // also send to specific user
    this.server.to(data.username).emit('myOrderComplete', data);
  }

  broadcastWaitTimeUpdate(data: { username: string; waitTime: number }) {
    this.server.to(data.username).emit('waitTimeUpdate', data);
  }
}
