// server.js
import 'dotenv/config';
import http from 'http';
import app from './App.js'; // matches file name App.js
import { connectDB, disconnectDB } from './config/database.js';

const PORT = Number(process.env.PORT) || 3000;
let server;

/**
 * Start application: connect DB then start HTTP server
 */
async function start() {
  try {
    await connectDB();
    console.log('✅ Database connection successful');

    server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start application:', err);
    process.exit(1);
  }
}

/**
 * Graceful shutdown
 */
async function gracefulShutdown(signal) {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) return reject(err);
          console.log('HTTP server closed');
          resolve();
        });
      });
    }

    await disconnectDB();
    console.log('DB connection closed');

    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown', err);
    process.exit(1);
  }
}

// Start
start();

// Signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Safety handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception', err);
  gracefulShutdown('uncaughtException');
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection', reason);
  gracefulShutdown('unhandledRejection');
});