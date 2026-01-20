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
// Allow dynamic frontend ports (5173, 5174, etc.) for development
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// CORS configuration - allow all localhost ports in development
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // In development, allow any localhost port
    if (process.env.NODE_ENV !== 'production') {
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }
    }
    
    // In production, use configured FRONTEND_URL
    if (origin === FRONTEND_URL) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
};

// Initialize Socket.IO with dynamic CORS
const io = new Server(httpServer, {
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin
      if (!origin) {
        return callback(null, true);
      }
      
      // In development, allow any localhost port
      if (process.env.NODE_ENV !== 'production') {
        if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
          return callback(null, true);
        }
      }
      
      // In production, use configured FRONTEND_URL
      if (origin === FRONTEND_URL) {
        return callback(null, true);
      }
      
      callback(new Error('Not allowed by CORS'));
    },
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
// Dynamically allows any localhost port in development
app.use(cors(corsOptions));

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
    httpServer.listen(PORT, () => {
      console.log('\n🚀 Server Started Successfully!');
      console.log(`📍 Server running on: http://localhost:${PORT}`);
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


