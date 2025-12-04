import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import adminRoutes from './routes/admin.routes';
import orderRoutes from './routes/order.routes';
import paymentRoutes from './routes/payment.routes';
import path from 'path';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = parseInt(process.env.PORT || '3000', 10);

const allowedOrigins = [
  'http://localhost:5173',
  'https://shoestorereactv2.onrender.com',
  'https://shoestore-frontend.onrender.com',
  'https://shoestore-frontend-relz.onrender.com',
  'https://shoestore-frontend-relz.onrender.com/',
  process.env.FRONTEND_URL || 'http://localhost:5173'
].filter(Boolean);

const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    if (!origin) {
      console.log('[CORS] Request without origin - allowing');
      return callback(null, true);
    }
    
    console.log(`[CORS] Checking origin: ${origin}`);
    console.log(`[CORS] Allowed origins: ${JSON.stringify(allowedOrigins)}`);
    
    const isAllowed = allowedOrigins.some(allowed => {
      const cleanOrigin = origin.replace(/\/$/, '').toLowerCase();
      const cleanAllowed = allowed.replace(/\/$/, '').toLowerCase();
      
      return cleanOrigin === cleanAllowed || 
             cleanOrigin.includes(cleanAllowed.replace(/https?:\/\//, ''));
    });
    
    if (isAllowed) {
      console.log(`[CORS] Origin ${origin} is allowed`);
      callback(null, true);
    } else {
      console.warn(`[CORS] Origin ${origin} is NOT allowed`);
      callback(new Error(`CORS not allowed for origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'X-Requested-With',
    'X-CSRF-Token',
    'Cache-Control'
  ],
  exposedHeaders: [
    'Authorization',
    'X-Total-Count',
    'Content-Range'
  ],
  maxAge: 86400, // 24 часа
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

app.options('*', cors(corsOptions));

app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.some(allowed => 
    origin.includes(allowed.replace(/https?:\/\//, '').replace(/\/$/, ''))
  )) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
  
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  console.log(`\n=== REQUEST ===`);
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log(`Origin: ${req.headers.origin || 'none'}`);
  console.log(`User-Agent: ${req.headers['user-agent']?.substring(0, 50)}...`);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    console.log(`CORS Headers Sent:`);
    console.log(`- Allow-Origin: ${res.getHeader('access-control-allow-origin')}`);
    console.log(`- Allow-Credentials: ${res.getHeader('access-control-allow-credentials')}`);
    console.log(`=== END ===\n`);
  });
  
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const productsCount = await prisma.product.count();
    const usersCount = await prisma.user.count();
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      service: 'ShoeStore API',
      version: '1.0.0',
      database: 'connected',
      uptime: process.uptime(),
      stats: {
        products: productsCount,
        users: usersCount
      },
      cors: {
        allowedOrigins,
        currentOrigin: req.headers.origin || 'none'
      }
    });
  } catch (error: any) {
    console.error('[HEALTH CHECK ERROR]', error);
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
      details: error.message,
      cors: {
        allowedOrigins,
        currentOrigin: req.headers.origin || 'none'
      }
    });
  }
});

app.get('/', (req, res) => {
  res.json({
    message: 'ShoeStore API',
    version: '1.0.0',
    docs: 'https://shoestorereactv2.onrender.com/api/health',
    frontend: 'https://shoestore-frontend-relz.onrender.com'
  });
});

app.use('*', (req, res) => {
  console.warn(`[404] Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[GLOBAL ERROR]', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    origin: req.headers.origin
  });
  
  if (error.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      error: error.message,
      allowedOrigins,
      yourOrigin: req.headers.origin,
      timestamp: new Date().toISOString()
    });
  }
  
  res.status(error.status || 500).json({
    success: false,
    error: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
==========================================
🚀  ShoeStore API Server Started!
==========================================
📡  Port: ${PORT}
🌍  Environment: ${process.env.NODE_ENV || 'development'}
🔗  Backend URL: https://shoestorereactv2.onrender.com
🎨  Frontend URL: https://shoestore-frontend-relz.onrender.com
🔐  CORS Enabled for: 
    ${allowedOrigins.map(o => `    • ${o}`).join('\n')}
📊  Database: ${process.env.DATABASE_URL ? 'Configured' : 'NOT Configured!'}
==========================================
  `);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

export default app;