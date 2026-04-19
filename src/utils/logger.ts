import winston from 'winston';
import path from 'path';
import { config } from '@/config';

// Custom log format
const customFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  
  return msg;
});

// Create Winston logger instance
const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'phishguard-backend' },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
        customFormat
      ),
    }),

    // Write all logs to combined.log
    new winston.transports.File({
      filename: path.join(process.cwd(), config.LOG_FILE_PATH),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),

    // Write errors to error.log
    new winston.transports.File({
      filename: path.join(process.cwd(), config.LOG_ERROR_FILE_PATH),
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
  ],
  // Don't exit on unhandled errors
  exitOnError: false,
});

// Stream for Morgan HTTP logging middleware
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

// Log HTTP requests
export const logRequest = (req: any, res: any, duration: number) => {
  logger.info({
    method: req.method,
    url: req.originalUrl,
    status: res.statusCode,
    duration: `${duration}ms`,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
};

// Log errors
export const logError = (error: Error, context?: Record<string, any>) => {
  logger.error({
    message: error.message,
    stack: error.stack,
    ...context,
  });
};

// Log security events
export const logSecurityEvent = (event: string, details: Record<string, any>) => {
  logger.warn({
    type: 'SECURITY_EVENT',
    event,
    ...details,
  });
};

// Log database queries
export const logDatabaseQuery = (query: string, params?: any[]) => {
  if (config.isDevelopment) {
    logger.debug({
      type: 'DATABASE_QUERY',
      query,
      params,
    });
  }
};

export default logger;
