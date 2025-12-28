# Dynamic Priority Order Queue System

## 🎯 Proje Açıklaması
VIP kullanıcıların siparişlerinin öncelikli işlendiği, Redis tabanlı BullMQ kuyruğu kullanan asenkron sipariş işleme sistemi.

## ⚙️ Teknoloji Stack
- **Frontend**: Next.js + TypeScript + Tailwind CSS
- **Backend**: NestJS + TypeScript
- **Database**: MongoDB Atlas
- **Queue**: Redis + BullMQ
- **Real-time**: Socket.IO
- **Auth**: JWT

## 🚀 Kurulum

### 1. Redis Kurulumu (Windows)
Redis'i Windows'ta çalıştırmanın en kolay yolu Docker kullanmaktır:

```bash
docker run -d -p 6379:6379 --name redis redis
```

Veya Windows için Redis'i [buradan](https://github.com/tporadowski/redis/releases) indirebilirsiniz.

### 2. Backend Kurulumu
```bash
cd order-queue-backend
npm install
npm run start:dev
```

Backend http://localhost:3001 adresinde çalışacaktır.

### 3. Frontend Kurulumu
```bash
cd order-queue-frontend
npm install
npm run dev
```

Frontend http://localhost:3000 adresinde çalışacaktır.

## 📋 Özellikler

### Kullanıcı Özellikleri
- ✅ Kayıt olma (VIP seçeneği ile)
- ✅ Giriş yapma
- ✅ VIP kullanıcılar için sarı arka plan
- ✅ Normal kullanıcılar için beyaz arka plan

### Sipariş Sistemi
- ✅ Chair siparişi (10 saniye işleme süresi)
- ✅ Table siparişi (25 saniye işleme süresi)
- ✅ Başlangıç stoku: 20 Chair, 5 Table
- ✅ Gerçek zamanlı stok güncellemesi

### Queue Sistemi
- ✅ VIP siparişler normal siparişlerin önüne geçer
- ✅ Aynı öncelikteki siparişler sırayla işlenir
- ✅ İşlenmekte olan sipariş durdurulamaz
- ✅ Gerçek zamanlı queue görüntüleme
- ✅ Kalan süre gösterimi

### Real-time Güncellemeler
- ✅ Socket.IO ile anlık queue güncellemeleri
- ✅ Stok değişikliklerinin anlık yansıması
- ✅ İşleme ilerleme çubuğu
- ✅ Tahmini bekleme süresi (VIP geçişlerinde güncellenir)

## 🔧 Ortam Değişkenleri

### Backend (.env)
```
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
REDIS_HOST=localhost
REDIS_PORT=6379
```

## 📡 API Endpoints

### Auth
- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `POST /api/auth/login` - Giriş

### Orders
- `POST /api/orders` - Yeni sipariş oluştur
- `GET /api/orders` - Kullanıcının siparişlerini getir
- `GET /api/orders/queue` - Queue durumunu getir
- `GET /api/orders/wait-time` - Tahmini bekleme süresini getir

### Products
- `GET /api/products` - Ürünleri ve stok durumunu getir
- `POST /api/products/reset` - Stokları sıfırla

## 🎮 Kullanım
1. http://localhost:3000 adresine gidin
2. "Register" ile yeni hesap oluşturun (VIP seçeneğini işaretleyebilirsiniz)
3. Dashboard'a yönlendirileceksiniz
4. "Order Chair" veya "Order Table" butonlarıyla sipariş verin
5. Sağ panelde queue'yu gerçek zamanlı izleyin
6. VIP siparişlerin normal siparişlerin önüne geçtiğini gözlemleyin
