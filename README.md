# PhishGuard Backend API

Production-grade backend API for PhishGuard security awareness training platform.

## 🏗️ Tech Stack

- **Runtime:** Node.js 20+
- **Language:** TypeScript 5.7
- **Framework:** Express.js 4.x
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** Zod
- **Logging:** Winston
- **Security:** Helmet, CORS, Rate Limiting

## 📋 Prerequisites

- Node.js >= 20.0.0
- PostgreSQL >= 14.0
- npm >= 10.0.0

## 🚀 Getting Started

### 1. Clone and Install

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Edit .env with your configuration
```

**Required Environment Variables:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/phishguard"
JWT_SECRET="your-super-secret-jwt-key-min-32-characters"
JWT_REFRESH_SECRET="your-refresh-secret-min-32-characters"
SESSION_SECRET="your-session-secret-min-32-characters"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Seed database
npm run db:seed
```

### 4. Start Development Server

```bash
# Development mode with hot reload
npm run dev

# The server will start on http://localhost:3001
```

## 📁 Project Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── config/
│   │   └── index.ts           # Configuration management
│   ├── controllers/           # Request handlers
│   ├── middleware/
│   │   ├── auth.middleware.ts        # Authentication
│   │   ├── error.middleware.ts       # Error handling
│   │   ├── security.middleware.ts    # Security & rate limiting
│   │   └── validate.middleware.ts    # Request validation
│   ├── routes/                # API routes
│   ├── services/              # Business logic
│   ├── types/                 # TypeScript types
│   ├── utils/
│   │   ├── auth.ts           # JWT & password utilities
│   │   ├── database.ts       # Prisma client
│   │   ├── errors.ts         # Custom error classes
│   │   ├── logger.ts         # Winston logger
│   │   ├── response.ts       # Response utilities
│   │   └── validation.ts     # Zod schemas
│   ├── app.ts                # Express app setup
│   └── index.ts              # Server entry point
├── tests/                     # Test files
├── logs/                      # Log files
├── .env.example              # Environment template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start dev server with hot reload

# Production
npm run build        # Compile TypeScript
npm start            # Start production server

# Database
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:push      # Push schema changes
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio

# Code Quality
npm run lint         # Lint code
npm run lint:fix     # Fix linting issues
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
```

## 🔐 Security Features

- **Helmet.js** - Security HTTP headers
- **CORS** - Cross-Origin Resource Sharing
- **Rate Limiting** - Prevent brute force attacks
- **JWT Authentication** - Secure token-based auth
- **bcrypt** - Password hashing (12 rounds)
- **Input Validation** - Zod schema validation
- **SQL Injection Prevention** - Prisma ORM
- **XSS Protection** - Built-in Express escaping

## 📊 Database Models

- **User** - User accounts (admin/user)
- **Organization** - Multi-tenancy support
- **Campaign** - Phishing simulation campaigns
- **CampaignParticipant** - User participation tracking
- **EmailTemplate** - Phishing email templates
- **EmailEvent** - Email tracking (opens, clicks)
- **Quiz** - Security awareness quizzes
- **QuizQuestion** - Quiz questions
- **QuizAttempt** - User quiz attempts
- **AuditLog** - System audit trail
- **Session** - User sessions

## 🌐 API Endpoints

Base URL: `http://localhost:3001/api/v1`

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh access token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

### Users
- `GET /users` - List users
- `POST /users` - Create user
- `GET /users/:id` - Get user details
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `POST /users/bulk-upload` - Bulk upload users

### Campaigns
- `GET /campaigns` - List campaigns
- `POST /campaigns` - Create campaign
- `GET /campaigns/:id` - Get campaign details
- `PATCH /campaigns/:id` - Update campaign
- `DELETE /campaigns/:id` - Delete campaign
- `POST /campaigns/:id/launch` - Launch campaign

### Templates
- `GET /templates` - List templates
- `POST /templates` - Create template
- `GET /templates/:id` - Get template
- `PATCH /templates/:id` - Update template
- `DELETE /templates/:id` - Delete template

### Health Check
- `GET /health` - Server health status

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## 📝 Logging

Logs are stored in the `logs/` directory:
- `logs/app.log` - All logs
- `logs/error.log` - Error logs only

Log levels: `error`, `warn`, `info`, `debug`

## 🚀 Deployment

### Build for Production

```bash
# Install dependencies
npm ci --only=production

# Generate Prisma client
npm run db:generate

# Build TypeScript
npm run build

# Run migrations
npm run db:migrate

# Start server
npm start
```

### Environment Variables for Production

Ensure these are set in production:
- `NODE_ENV=production`
- `DATABASE_URL` - Production database URL
- `JWT_SECRET` - Strong random secret (min 32 chars)
- `JWT_REFRESH_SECRET` - Different from JWT_SECRET
- `SESSION_SECRET` - Unique secret for sessions
- `CORS_ORIGIN` - Your frontend URL

## 🔧 Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
sudo service postgresql status

# Verify DATABASE_URL in .env
echo $DATABASE_URL

# Test connection
npm run db:studio
```

### Port Already in Use

```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>
```

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Zod Documentation](https://zod.dev/)

## 👥 Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Ensure linting passes
5. Submit a pull request

## 📄 License

MIT
