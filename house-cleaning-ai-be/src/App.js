// App.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes/index.js';

const app = express();

// Basic middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Mount API routes
app.use('/api', routes);

// Simple health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Debug helper: list registered routes (development only)
if (process.env.NODE_ENV !== 'production') {
  setImmediate(() => {
    console.log('Registered routes:');
    if (app._router && app._router.stack) {
      app._router.stack
        .filter((r) => r.route)
        .forEach((r) => console.log(Object.keys(r.route.methods), r.route.path));
    } else {
      console.log('No routes registered yet');
    }
  });
}

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Not Found' }));

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err?.status || 500;
  res.status(status).json({ message: err?.message || 'Internal Server Error' });
});

export default app;