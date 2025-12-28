'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface QueueOrder {
  jobId: string;
  orderId: string;
  username: string;
  productType: string;
  quantity: number;
  processingTime: number;
  remainingTime?: number;
  isVip: boolean;
  priority: number;
  status?: string;
}

interface QueueState {
  active: QueueOrder[];
  waiting: QueueOrder[];
}

interface Product {
  type: string;
  name: string;
  quantity: number;
  processingTimePerUnit: number;
}

interface ProcessingProgress {
  orderId: string;
  username: string;
  productType: string;
  isVip: boolean;
  totalTime: number;
  elapsed: number;
  remainingTime: number;
}

interface SocketContextType {
  socket: Socket | null;
  queueState: QueueState;
  products: Product[];
  processingProgress: ProcessingProgress | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SOCKET_URL = 'http://localhost:3001';

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [queueState, setQueueState] = useState<QueueState>({
    active: [],
    waiting: [],
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [processingProgress, setProcessingProgress] =
    useState<ProcessingProgress | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);

      newSocket.emit('getQueueState');
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('queueUpdate', (data: QueueState) => {
      console.log('Queue update:', data);
      setQueueState(data);
    });

    newSocket.on('stockUpdate', (data: Product[]) => {
      console.log('Stock update:', data);
      setProducts(data);
    });

    newSocket.on('processingProgress', (data: ProcessingProgress) => {
      setProcessingProgress(data);
    });

    newSocket.on(
      'orderComplete',
      (data: { orderId: string; username: string; productType: string }) => {
        console.log('Order complete:', data);
      }
    );

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (socket && user) {
      socket.emit('joinRoom', user.username);

      socket.emit('getQueueState');
    }
  }, [socket, user]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/products');
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <SocketContext.Provider
      value={{ socket, queueState, products, processingProgress, isConnected }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
