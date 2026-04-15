import { createApp } from './app';
import { config } from '@/config';
import logger from '@/utils/logger';
import { connectDatabase, disconnectDatabase } from '@/utils/database';

/**
 * Start the server
 */
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();

    // Create Express app
    const app = createApp();

    // Start listening
    const server = app.listen(config.PORT, () => {
      logger.info('🚀 ============================================');
      logger.info(`🚀 Server started successfully!`);
      logger.info(`🚀 Environment: ${config.NODE_ENV}`);
      logger.info(`🚀 Port: ${config.PORT}`);
      logger.info(`🚀 API Version: ${config.API_VERSION}`);
      logger.info(`🚀 Health Check: http://localhost:${config.PORT}/health`);
      logger.info(`🚀 API Base URL: http://localhost:${config.PORT}/api/${config.API_VERSION}`);
      logger.info('🚀 ============================================');
    });

    // Graceful shutdown handling
    const gracefulShutdown = async (signal: string) => {
      logger.info(`\n${signal} received, starting graceful shutdown...`);

      // Stop accepting new connections
      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          // Disconnect from database
          await disconnectDatabase();

          logger.info('Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during graceful shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
      logger.error(error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any) => {
      logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
      logger.error(reason);
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
