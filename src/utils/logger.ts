import winston from 'winston';
import path from 'path';

// Read env directly — logger must initialise before config to avoid circular deps
const NODE_ENV = process.env.NODE_ENV || 'development';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const LOG_FILE_PATH = process.env.LOG_FILE_PATH || 'logs/app.log';
const LOG_ERROR_FILE_PATH = process.env.LOG_ERROR_FILE_PATH || 'logs/error.log';
const isProduction = NODE_ENV === 'production';
const isDevelopment = NODE_ENV === 'development';

const customFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

// File transports are disabled in production — Railway filesystem is ephemeral
// Console-only logging works fine with Railway's log aggregation
const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      isProduction ? winston.format.uncolorize() : winston.format.colorize(),
      winston.format.simple(),
      customFormat
    ),
  }),
];

if (!isProduction) {
  transports.push(
    new winston.transports.File({
      filename: path.join(process.cwd(), LOG_FILE_PATH),
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    }),
    new winston.transports.File({
      filename: path.join(process.cwd(), LOG_ERROR_FILE_PATH),
      level: 'error',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    })
  );
}

const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'phishguard-backend' },
  transports,
  exitOnError: false,
});

export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

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

export const logError = (error: Error, context?: Record<string, any>) => {
  logger.error({
    message: error.message,
    stack: error.stack,
    ...context,
  });
};

export const logSecurityEvent = (event: string, details: Record<string, any>) => {
  logger.warn({
    type: 'SECURITY_EVENT',
    event,
    ...details,
  });
};

export const logDatabaseQuery = (query: string, params?: any[]) => {
  if (isDevelopment) {
    logger.debug({
      type: 'DATABASE_QUERY',
      query,
      params,
    });
  }
};

export default logger;
