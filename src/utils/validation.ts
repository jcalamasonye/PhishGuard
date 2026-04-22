import { z } from 'zod';

// Email validation
export const emailSchema = z.string().email('Invalid email address').trim().toLowerCase();

// Password validation
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// UUID validation
export const uuidSchema = z.string().uuid('Invalid UUID format');

// Pagination validation
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

// Date validation
export const dateSchema = z.string().datetime().or(z.date());

// Auth validation schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: emailSchema,
  password: passwordSchema,
  organizationName: z.string().min(2).max(200).optional(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// User validation schemas
export const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: emailSchema,
  department: z.string().min(1).max(100).optional(),
  role: z.enum(['ADMIN', 'USER']).default('USER'),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  department: z.string().min(1).max(100).optional(),
  avatar: z.string().url().optional(),
});

export const bulkUploadUsersSchema = z.object({
  users: z.array(
    z.object({
      name: z.string().min(2).max(100),
      email: emailSchema,
      department: z.string().optional(),
    })
  ).min(1, 'At least one user is required'),
  sendWelcomeEmail: z.boolean().default(true),
});

// Campaign validation schemas
export const createCampaignSchema = z.object({
  name: z.string().min(3, 'Campaign name must be at least 3 characters').max(200),
  description: z.string().max(1000).optional(),
  templateId: uuidSchema,
  recipientIds: z.array(uuidSchema).min(1, 'At least one recipient is required'),
  scheduledAt: dateSchema.optional(),
});

export const updateCampaignSchema = z.object({
  name: z.string().min(3).max(200).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(['DRAFT', 'SCHEDULED', 'ACTIVE', 'COMPLETED']).optional(),
});

export const campaignFiltersSchema = z.object({
  status: z.enum(['DRAFT', 'SCHEDULED', 'ACTIVE', 'COMPLETED', 'all']).optional(),
  dateFrom: dateSchema.optional(),
  dateTo: dateSchema.optional(),
  search: z.string().optional(),
});

// Template validation schemas
export const createTemplateSchema = z.object({
  name: z.string().min(3).max(200),
  description: z.string().min(10).max(1000),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  category: z.enum([
    'PASSWORD',
    'PACKAGE',
    'EXECUTIVE',
    'PAYROLL',
    'SECURITY',
    'VENDOR',
    'HR',
    'SOCIAL',
    'BANK',
    'IT',
  ]),
  subject: z.string().min(3).max(200),
  fromName: z.string().min(2).max(100),
  fromEmail: emailSchema,
  body: z.string().min(10, 'Email body must be at least 10 characters'),
  ctaText: z.string().max(100).optional(),
  ctaUrl: z.string().url().optional(),
  redFlags: z.array(z.string()).min(1, 'At least one red flag is required'),
});

export const updateTemplateSchema = createTemplateSchema.partial();

// Quiz validation schemas
export const createQuizSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(1000).optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  category: z.enum([
    'PASSWORD',
    'PACKAGE',
    'EXECUTIVE',
    'PAYROLL',
    'SECURITY',
    'VENDOR',
    'HR',
    'SOCIAL',
    'BANK',
    'IT',
  ]),
  timeLimit: z.number().int().positive().optional(),
  passingScore: z.number().int().min(0).max(100).default(70),
  questions: z.array(
    z.object({
      question: z.string().min(10),
      options: z.array(z.string()).min(2).max(6),
      correctAnswer: z.number().int().min(0),
      explanation: z.string().optional(),
      order: z.number().int().min(0),
    })
  ).min(1, 'At least one question is required'),
});

export const submitQuizSchema = z.object({
  answers: z.record(z.number().int()),
  timeSpent: z.number().int().positive(),
});

// Organization validation schemas
export const updateOrganizationSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  logo: z.string().url().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
  smtpHost: z.string().optional(),
  smtpPort: z.number().int().positive().optional(),
  smtpUser: z.string().optional(),
  smtpPassword: z.string().optional(),
  fromEmail: emailSchema.optional(),
  fromName: z.string().optional(),
});

// Helper to validate data against schema
export const validate = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  return schema.parse(data);
};

// Helper for safe validation (returns errors instead of throwing)
export const validateSafe = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } => {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return { success: false, errors: result.error };
};