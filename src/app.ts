import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import { config } from '@/config';
import {
  helmetMiddleware,
  corsMiddleware,
  rateLimiter,
} from '@/middleware/security.middleware';
import { errorHandler, notFound } from '@/middleware/error.middleware';
import logger from '@/utils/logger';
import routes from '@/routes';

/**
 * Create and configure Express application
 */
export const createApp = (): Application => {
  const app = express();

  // ============================================
  // SECURITY MIDDLEWARE
  // ============================================
  app.use(helmetMiddleware);
  app.use(corsMiddleware);
  
  // ============================================
  // BODY PARSING MIDDLEWARE
  // ============================================
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // ============================================
  // REQUEST LOGGING (Development only)
  // ============================================
  if (config.isDevelopment) {
    app.use((req, res, next) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info({
          method: req.method,
          url: req.originalUrl,
          status: res.statusCode,
          duration: `${duration}ms`,
          ip: req.ip,
        });
      });
      
      next();
    });
  }

  // ============================================
  // HEALTH CHECK ENDPOINT
  // ============================================
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.NODE_ENV,
    });
  });

  app.get('/', (req, res) => {
    res.json({
      name: 'PhishGuard API',
      version: config.API_VERSION,
      environment: config.NODE_ENV,
      documentation: `/api/${config.API_VERSION}/docs`,
      health: '/health',
    });
  });

  // ============================================
  // API ROUTES
  // ============================================
  const apiPrefix = `/api/${config.API_VERSION}`;

  // Apply rate limiting to API routes
  app.use(apiPrefix, rateLimiter);

  // Register all routes
  app.use(apiPrefix, routes);

  // ============================================
  // ERROR HANDLING
  // ============================================
  
  // 404 handler - must be after all routes
  app.use(notFound);

  // Global error handler - must be last
  app.use(errorHandler);

  return app;
};
