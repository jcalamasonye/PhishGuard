import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '@/utils/errors';
import { verifyAccessToken, extractTokenFromHeader } from '@/utils/auth';
import prisma from '@/utils/database';
import { logSecurityEvent } from '@/utils/logger';

/**
 * Extend Express Request to include user
 */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    organizationId?: string;
  };
}

/**
 * Authenticate middleware - Verify JWT token
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      throw new UnauthorizedError('No authentication token provided');
    }

    // Verify token
    const payload = verifyAccessToken(token);

    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        organizationId: true,
        lastActiveAt: true,
      },
    });

    if (!user) {
      logSecurityEvent('INVALID_TOKEN_USER_NOT_FOUND', {
        userId: payload.userId,
        ip: req.ip,
      });
      throw new UnauthorizedError('User not found');
    }

    // Update last active timestamp (async, don't wait)
    prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    }).catch(() => {
      // Ignore error, this is not critical
    });

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId || undefined,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Require Admin role
 */
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (req.user.role !== 'ADMIN') {
      logSecurityEvent('UNAUTHORIZED_ADMIN_ACCESS_ATTEMPT', {
        userId: req.user.id,
        role: req.user.role,
        path: req.path,
        ip: req.ip,
      });
      throw new ForbiddenError('Admin access required');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Require User role (any authenticated user)
 */
export const requireUser = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication - attach user if token exists, but don't require it
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (token) {
      const payload = verifyAccessToken(token);

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          role: true,
          organizationId: true,
        },
      });

      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId || undefined,
        };
      }
    }

    next();
  } catch (error) {
    // Don't fail on optional auth, just continue without user
    next();
  }
};

/**
 * Require same organization - User can only access resources from their organization
 */
export const requireSameOrganization = (organizationIdParam = 'organizationId') => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const requestedOrgId = req.params[organizationIdParam] || req.body?.organizationId;

      // Admin can access any organization
      if (req.user.role === 'ADMIN' && req.user.organizationId) {
        // But regular admins can only access their own org
        if (requestedOrgId && requestedOrgId !== req.user.organizationId) {
          logSecurityEvent('CROSS_ORGANIZATION_ACCESS_ATTEMPT', {
            userId: req.user.id,
            userOrgId: req.user.organizationId,
            requestedOrgId,
            path: req.path,
            ip: req.ip,
          });
          throw new ForbiddenError('Access denied to this organization');
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
