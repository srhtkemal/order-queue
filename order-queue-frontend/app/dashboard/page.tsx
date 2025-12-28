'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useRouter } from 'next/navigation';
import QueueDisplay from '../components/QueueDisplay';

interface UserOrder {
  _id: string;
  productType: string;
  quantity: number;
  status: string;
  processingTime: number;
  createdAt: string;
}

export default function DashboardPage() {
  const { user, token, logout, isLoading: authLoading } = useAuth();
  const { products, queueState, processingProgress, isConnected } = useSocket();
  const router = useRouter();
  const [userOrders, setUserOrders] = useState<UserOrder[]>([]);
  const [isOrdering, setIsOrdering] = useState(false);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchUserOrders = async () => {
    if (!token) return;
    try {
      const response = await fetch('http://localhost:3001/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUserOrders(data);
      }
    } catch (error) {
      console.error('failed to fetch orders:', error);
    }
  };

  const calculateWaitTime = () => {
    let totalWait = 0;
    if (processingProgress) {
      totalWait += processingProgress.remainingTime;
    }
    const userPendingOrders = userOrders.filter(o => o.status === 'pending');
    if (userPendingOrders.length > 0) {
      for (const waitingOrder of queueState.waiting) {
        const isUserOrder = userPendingOrders.some(uo => uo._id === waitingOrder.orderId);
        if (isUserOrder) break;
        totalWait += waitingOrder.processingTime;
      }
      for (const userOrder of userPendingOrders) {
        totalWait += userOrder.processingTime;
      }
    }
    setEstimatedWaitTime(totalWait);
  };

  useEffect(() => {
    fetchUserOrders();
  }, [token]);

  useEffect(() => {
    fetchUserOrders();
    calculateWaitTime();
  }, [queueState, processingProgress]);

  useEffect(() => {
    calculateWaitTime();
  }, [userOrders, queueState, processingProgress]);

  const handleOrder = async (productType: 'chair' | 'table') => {
    if (!token) return;
    setIsOrdering(true);
    try {
      const response = await fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productType, quantity: 1 }),
      });
      if (response.ok) {
        await fetchUserOrders();
      } else {
        const error = await response.json();
        alert(error.message || 'failed to create order');
      }
    } catch (error) {
      console.error('failed to create order:', error);
      alert('failed to create order');
    } finally {
      setIsOrdering(false);
    }
  };

  const getProductQuantity = (type: string) => {
    const product = products.find(p => p.type === type);
    return product?.quantity ?? 0;
  };

  const hasPendingOrders = userOrders.some(o => o.status === 'pending' || o.status === 'processing');
  const allOrdersComplete = userOrders.length > 0 && userOrders.every(o => o.status === 'completed');

  if (authLoading || !user) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        paddingBottom: '10px',
        borderBottom: '1px solid #ccc'
      }}>
        <div>
          <strong>{user.username}</strong>
          {user.isVip && <span style={{ color: '#cc6600', marginLeft: '5px' }}>[VIP]</span>}
          <span style={{ 
            marginLeft: '10px', 
            color: isConnected ? 'green' : 'red',
            fontSize: '12px' 
          }}>
            {isConnected ? '● connected' : '○ disconnected'}
          </span>
        </div>
        <button
          onClick={logout}
          style={{ padding: '5px 10px', background: '#c00', color: '#fff', border: 'none', fontSize: '12px' }}
        >
          Logout
        </button>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {/* left - orders */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          {/* order buttons */}
          <div style={{ border: '1px solid #ccc', padding: '15px', background: '#fff', marginBottom: '15px' }}>
            <div style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>ORDER</div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              {/* chair */}
              <div style={{ flex: 1, border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', marginBottom: '5px' }}>CHAIR (10s)</div>
                <div style={{ marginBottom: '5px' }}>
                  Stock: <span style={{ color: getProductQuantity('chair') > 0 ? 'green' : 'red' }}>
                    {getProductQuantity('chair')}
                  </span>
                </div>
                <button
                  onClick={() => handleOrder('chair')}
                  disabled={isOrdering || getProductQuantity('chair') <= 0}
                  style={{
                    padding: '5px 15px',
                    background: isOrdering || getProductQuantity('chair') <= 0 ? '#999' : '#0066cc',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                    width: '100%'
                  }}
                >
                  Order
                </button>
              </div>

              {/* table */}
              <div style={{ flex: 1, border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', marginBottom: '5px' }}>TABLE (25s)</div>
                <div style={{ marginBottom: '5px' }}>
                  Stock: <span style={{ color: getProductQuantity('table') > 0 ? 'green' : 'red' }}>
                    {getProductQuantity('table')}
                  </span>
                </div>
                <button
                  onClick={() => handleOrder('table')}
                  disabled={isOrdering || getProductQuantity('table') <= 0}
                  style={{
                    padding: '5px 15px',
                    background: isOrdering || getProductQuantity('table') <= 0 ? '#999' : '#0066cc',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                    width: '100%'
                  }}
                >
                  Order
                </button>
              </div>
            </div>
          </div>

          {/* order status */}
          <div style={{ border: '1px solid #ccc', padding: '15px', background: '#fff' }}>
            <div style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>YOUR ORDERS</div>
            
            {hasPendingOrders && (
              <div style={{ background: '#e6f3ff', border: '1px solid #0066cc', padding: '8px', marginBottom: '10px', fontSize: '12px' }}>
                Estimated wait: <strong>{estimatedWaitTime}s</strong>
                <div style={{ fontSize: '11px', color: '#666' }}>(may change if VIP orders added)</div>
              </div>
            )}

            {allOrdersComplete && userOrders.length > 0 && (
              <div style={{ background: '#e6ffe6', border: '1px solid #090', padding: '8px', marginBottom: '10px', fontSize: '12px' }}>
                ✓ All orders ready!
              </div>
            )}

            {userOrders.length === 0 ? (
              <div style={{ color: '#666', fontSize: '12px' }}>No orders yet</div>
            ) : (
              <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    <th style={{ padding: '5px', textAlign: 'left', border: '1px solid #ddd' }}>Product</th>
                    <th style={{ padding: '5px', textAlign: 'left', border: '1px solid #ddd' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {userOrders.map((order) => (
                    <tr key={order._id}>
                      <td style={{ padding: '5px', border: '1px solid #ddd' }}>{order.productType}</td>
                      <td style={{ 
                        padding: '5px', 
                        border: '1px solid #ddd',
                        color: order.status === 'completed' ? 'green' : order.status === 'processing' ? '#cc6600' : '#666'
                      }}>
                        {order.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* right - queue */}
        <div style={{ width: '320px' }}>
          <QueueDisplay 
            queueState={queueState}
            processingProgress={processingProgress}
            currentUsername={user.username}
          />
        </div>
      </div>
    </div>
  );
}
