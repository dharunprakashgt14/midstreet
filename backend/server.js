/**
 * Main Server File
 * 
 * This is the entry point for the backend server.
 * It sets up Express, connects to MongoDB, and registers all routes.
 * 
 * To run: npm start (or npm run dev for auto-reload)
 */

console.log('🚀 Starting server...');

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';

// Import routes
import menuRoutes from './routes/menu.routes.js';
import orderRoutes from './routes/order.routes.js';
import adminRoutes from './routes/admin.routes.js';

// Load environment variables from .env file
dotenv.config();

// Create Express app
const app = express();

// Create HTTP server
const httpServer = createServer(app);

// Get port from environment or use default
const PORT = process.env.PORT || 5000;

// Get frontend URL for CORS
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const NODE_ENV = process.env.NODE_ENV || 'development';

console.log(`\n🔧 Environment Setup:`);
console.log(`   NODE_ENV: ${NODE_ENV}`);
console.log(`   FRONTEND_URL: ${FRONTEND_URL}`);
console.log(`   Is Development: ${NODE_ENV === 'development'}\n`);

// CORS configuration - completely permissive for development
const corsOptions = {
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Initialize Socket.IO with permissive CORS
const io = new Server(httpServer, {
  cors: {
    origin: true, // Allow all origins
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Make io available to routes/controllers
app.set('io', io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  // Handle joining order room (for customer order status updates)
  socket.on('join:order', (orderId) => {
    socket.join(`order:${orderId}`);
    console.log(`📦 Client ${socket.id} joined order room: order:${orderId}`);
  });

  // Handle leaving order room
  socket.on('leave:order', (orderId) => {
    socket.leave(`order:${orderId}`);
    console.log(`📦 Client ${socket.id} left order room: order:${orderId}`);
  });

  // Handle joining table room (for customer order status updates by table)
  socket.on('join:table', (tableNumber) => {
    socket.join(`table:${tableNumber}`);
    console.log(`📦 Client ${socket.id} joined table room: table:${tableNumber}`);
  });

  // Handle leaving table room
  socket.on('leave:table', (tableNumber) => {
    socket.leave(`table:${tableNumber}`);
    console.log(`📦 Client ${socket.id} left table room: table:${tableNumber}`);
  });

  // Handle admin joining admin room
  socket.on('join:admin', () => {
    socket.join('admin');
    console.log(`👤 Admin client ${socket.id} joined admin room`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// ============================================
// MIDDLEWARE
// ============================================

// Enable CORS (Cross-Origin Resource Sharing)
// This allows the frontend (running on different port) to access the backend
app.use(cors(corsOptions));

// Manual CORS headers middleware for extra safety
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Allow all origins in development
  if (NODE_ENV === 'development') {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  } else {
    // Production - restrict to frontend URL
    res.header('Access-Control-Allow-Origin', FRONTEND_URL);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Parse JSON request bodies
// This allows us to read JSON data from request.body
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// ============================================
// ROUTES
// ============================================

// Health check endpoint (to test if server is running)
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running!',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler (for routes that don't exist)
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `The route ${req.originalUrl} does not exist.`
  });
});

// Error handling middleware (catches any errors in routes)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// START SERVER
// ============================================

// Connect to MongoDB Atlas, then start the server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Handle server errors (EADDRINUSE, etc.)
    httpServer.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${PORT} is already in use.`);
        console.error(`   Another process is using port ${PORT}.`);
        console.error(`   Please stop the other process or use a different port.\n`);
        console.error(`   To find and kill the process on Windows:`);
        console.error(`   1. Run: netstat -ano | findstr :${PORT}`);
        console.error(`   2. Note the PID from the output`);
        console.error(`   3. Run: taskkill /PID <PID> /F\n`);
      } else {
        console.error('❌ Server error:', error);
      }
      process.exit(1);
    });
    
    // Start listening for requests
    // Bind to 0.0.0.0 to accept connections from any interface (required for Render)
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log('\n🚀 Server Started Successfully!');
      console.log(`📍 Server running on: http://0.0.0.0:${PORT}`);
      console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
      console.log(`📡 API Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🔌 Socket.IO enabled for real-time updates`);
      console.log('\n📋 Available API Endpoints:');
      console.log('   GET    /api/menu');
      console.log('   POST   /api/orders');
      console.log('   GET    /api/orders/:id');
      console.log('   PATCH  /api/orders/:id/add-item');
      console.log('   PATCH  /api/orders/:id/status');
      console.log('   POST   /api/admin/login');
      console.log('   GET    /api/admin/orders (protected)');
      console.log('   GET    /api/admin/summary (protected)');
      console.log('\n✨ Ready to accept requests!\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Graceful shutdown handlers
process.on('SIGTERM', () => {
  console.log('\n⚠️  SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});


