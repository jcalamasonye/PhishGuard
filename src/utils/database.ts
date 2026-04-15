import { PrismaClient } from '@prisma/client';
import logger, { logDatabaseQuery } from './logger';
import { config } from '@/config';

/**
 * Prisma Client Extension for logging
 */
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: config.isDevelopment
      ? [
          { emit: 'event', level: 'query' },
          { emit: 'event', level: 'error' },
          { emit: 'event', level: 'warn' },
        ]
      : [{ emit: 'event', level: 'error' }],
  });
};

// Declare global type for Prisma client
declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

// Create singleton instance
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

// Store in global for development hot-reload
if (config.isDevelopment) {
  globalThis.prismaGlobal = prisma;
}

// Log queries in development
if (config.isDevelopment) {
  prisma.$on('query' as never, (e: any) => {
    logDatabaseQuery(e.query, e.params);
  });
}

// Log errors
prisma.$on('error' as never, (e: any) => {
  logger.error('Database error:', e);
});

// Log warnings
prisma.$on('warn' as never, (e: any) => {
  logger.warn('Database warning:', e);
});

/**
 * Connect to database
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('✓ Database connected successfully');
  } catch (error) {
    logger.error('✗ Database connection failed:', error);
    throw error;
  }
};

/**
 * Disconnect from database
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('✓ Database disconnected successfully');
  } catch (error) {
    logger.error('✗ Database disconnection failed:', error);
    throw error;
  }
};

/**
 * Check database connection health
 */
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('Database health check failed:', error);
    return false;
  }
};

export default prisma;
