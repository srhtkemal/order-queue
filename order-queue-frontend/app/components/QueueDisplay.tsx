'use client';

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

interface ProcessingProgress {
  orderId: string;
  username: string;
  productType: string;
  isVip: boolean;
  totalTime: number;
  elapsed: number;
  remainingTime: number;
}

interface QueueDisplayProps {
  queueState: QueueState;
  processingProgress: ProcessingProgress | null;
  currentUsername: string;
}

export default function QueueDisplay({ queueState, processingProgress, currentUsername }: QueueDisplayProps) {
  return (
    <div style={{ border: '1px solid #ccc', padding: '15px', background: '#fff' }}>
      <div style={{ marginBottom: '10px', fontSize: '14px', fontWeight: 'bold' }}>LIVE QUEUE</div>

      {/* currently processing */}
      <div style={{ marginBottom: '15px' }}>
        <div style={{ fontSize: '11px', color: '#666', marginBottom: '5px' }}>PROCESSING:</div>
        {processingProgress ? (
          <div style={{ 
            padding: '8px', 
            border: '1px solid #ddd',
            background: processingProgress.isVip ? '#fff8e6' : '#f9f9f9'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ 
                  fontWeight: processingProgress.username === currentUsername ? 'bold' : 'normal',
                  color: processingProgress.username === currentUsername ? 'green' : '#333'
                }}>
                  {processingProgress.username}
                  {processingProgress.username === currentUsername && ' (You)'}
                </span>
                {processingProgress.isVip && <span style={{ color: '#cc6600', marginLeft: '5px' }}>[VIP]</span>}
                <span style={{ color: '#666', marginLeft: '5px', fontSize: '12px' }}>
                  ({processingProgress.productType})
                </span>
              </div>
              <div style={{ fontWeight: 'bold' }}>{processingProgress.remainingTime}s</div>
            </div>
            {/* bar */}
            <div style={{ 
              width: '100%', 
              height: '6px', 
              background: '#ddd', 
              marginTop: '5px' 
            }}>
              <div style={{ 
                width: `${(processingProgress.elapsed / processingProgress.totalTime) * 100}%`,
                height: '100%',
                background: processingProgress.isVip ? '#cc6600' : '#0066cc',
                transition: 'width 1s linear'
              }} />
            </div>
          </div>
        ) : (
          <div style={{ padding: '8px', background: '#f5f5f5', color: '#999', fontSize: '12px' }}>
            No order processing
          </div>
        )}
      </div>

      <div>
        <div style={{ fontSize: '11px', color: '#666', marginBottom: '5px' }}>
          WAITING - ({queueState.waiting.length}):
        </div>
        
        {queueState.waiting.length === 0 ? (
          <div style={{ padding: '8px', background: '#f5f5f5', color: '#999', fontSize: '12px' }}>
            Queue empty
          </div>
        ) : (
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {queueState.waiting.map((order, index) => (
              <div
                key={order.orderId}
                style={{ 
                  padding: '6px 8px', 
                  borderBottom: '1px solid #eee',
                  background: order.username === currentUsername ? '#e6ffe6' : (order.isVip ? '#fff8e6' : '#fff'),
                  fontSize: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ color: '#999', marginRight: '8px' }}>#{index + 1}</span>
                    <span style={{ 
                      fontWeight: order.username === currentUsername ? 'bold' : 'normal',
                      color: order.username === currentUsername ? 'green' : '#333'
                    }}>
                      {order.username}
                      {order.username === currentUsername && ' (You)'}
                    </span>
                    {order.isVip && <span style={{ color: '#cc6600', marginLeft: '5px' }}>[VIP]</span>}
                  </div>
                  <div style={{ color: '#666' }}>
                    {order.productType} ({order.processingTime}s)
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


      <div style={{ 
        marginTop: '10px', 
        paddingTop: '10px', 
        borderTop: '1px solid #ddd', 
        fontSize: '11px',
        color: '#666'
      }}>
        <div>Total: {queueState.waiting.length + (processingProgress ? 1 : 0)}</div>
        <div>VIP: <span style={{ color: '#cc6600' }}>
          {queueState.waiting.filter(o => o.isVip).length + (processingProgress?.isVip ? 1 : 0)}
        </span></div>
      </div>
    </div>
  );
}
