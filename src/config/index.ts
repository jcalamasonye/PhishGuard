import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();
class Config {
  // Server
  public readonly NODE_ENV: string;
  public readonly PORT: number;
  public readonly API_VERSION: string;

  // Database
  public readonly DATABASE_URL: string;

  // JWT
  public readonly JWT_SECRET: string;
  public readonly JWT_EXPIRES_IN: string;
  public readonly JWT_REFRESH_SECRET: string;
  public readonly JWT_REFRESH_EXPIRES_IN: string;

  // Security
  public readonly BCRYPT_ROUNDS: number;
  public readonly RATE_LIMIT_WINDOW_MS: number;
  public readonly RATE_LIMIT_MAX_REQUESTS: number;
  public readonly CORS_ORIGIN: string;

  // Email (SMTP)
  public readonly SMTP_HOST: string;
  public readonly SMTP_PORT: number;
  public readonly SMTP_SECURE: boolean;
  public readonly SMTP_USER: string;
  public readonly SMTP_PASSWORD: string;
  public readonly FROM_EMAIL: string;
  public readonly FROM_NAME: string;

  // Logging
  public readonly LOG_LEVEL: string;
  public readonly LOG_FILE_PATH: string;
  public readonly LOG_ERROR_FILE_PATH: string;

  // Frontend
  public readonly FRONTEND_URL: string;

  // File Upload
  public readonly MAX_FILE_SIZE: number;
  public readonly UPLOAD_DIR: string;

  // Session
  public readonly SESSION_SECRET: string;
  public readonly SESSION_TIMEOUT: number;

  constructor() {
    // Server
    this.NODE_ENV = process.env.NODE_ENV || 'development';
    this.PORT = parseInt(process.env.PORT || '3001', 10);
    this.API_VERSION = process.env.API_VERSION || 'v1';

    // Database
    this.DATABASE_URL = this.getEnvVar('DATABASE_URL');

    // JWT
    this.JWT_SECRET = this.getEnvVar('JWT_SECRET');
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
    this.JWT_REFRESH_SECRET = this.getEnvVar('JWT_REFRESH_SECRET');
    this.JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

    // Security
    this.BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
    this.RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10);
    this.RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10);
    this.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

    // Email
    this.SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
    this.SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
    this.SMTP_SECURE = process.env.SMTP_SECURE === 'true';
    this.SMTP_USER = process.env.SMTP_USER || '';
    this.SMTP_PASSWORD = process.env.SMTP_PASSWORD || '';
    this.FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@phishguard.com';
    this.FROM_NAME = process.env.FROM_NAME || 'PhishGuard Security';

    // Logging
    this.LOG_LEVEL = process.env.LOG_LEVEL || 'info';
    this.LOG_FILE_PATH = process.env.LOG_FILE_PATH || 'logs/app.log';
    this.LOG_ERROR_FILE_PATH = process.env.LOG_ERROR_FILE_PATH || 'logs/error.log';

    // Frontend
    this.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

    // File Upload
    this.MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880', 10); // 5MB
    this.UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

    // Session
    this.SESSION_SECRET = this.getEnvVar('SESSION_SECRET');
    this.SESSION_TIMEOUT = parseInt(process.env.SESSION_TIMEOUT || '86400000', 10);

    // Validate configuration
    this.validate();
  }

  
  //  Get environment variable or throw error if not found
  private getEnvVar(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  }

  // Validate configuration
  private validate(): void {
    if (this.PORT < 1 || this.PORT > 65535) {
      throw new Error('PORT must be between 1 and 65535');
    }

    if (this.BCRYPT_ROUNDS < 10 || this.BCRYPT_ROUNDS > 15) {
      console.warn('BCRYPT_ROUNDS should be between 10 and 15 for optimal security/performance balance');
    }

    if (this.NODE_ENV === 'production') {
      if (this.JWT_SECRET.length < 32) {
        throw new Error('JWT_SECRET must be at least 32 characters in production');
      }

      if (this.SESSION_SECRET.length < 32) {
        throw new Error('SESSION_SECRET must be at least 32 characters in production');
      }
    }
  }

 
  // Check if running in production
   public get isProduction(): boolean {
    return this.NODE_ENV === 'production';
  }

  // Check if running in development
  public get isDevelopment(): boolean {
    return this.NODE_ENV === 'development';
  }

  // Check if running in test
  public get isTest(): boolean {
    return this.NODE_ENV === 'test';
  }
}

// Export singleton instance
export const config = new Config();

// Export Config class for testing
export { Config };
