import prisma from '../utils/database';
import { NotFoundError } from '../utils/errors';

export const templateService = {
  async getAll(filters: { category?: string; difficulty?: string; organizationId?: string; page?: number; limit?: number }) {
    const where: any = {};

    if (filters.organizationId) {
      where.OR = [
        { organizationId: filters.organizationId },
        { isSystem: true },
      ];
    }

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.difficulty) {
      where.difficulty = filters.difficulty;
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const [templates, total] = await Promise.all([
      prisma.emailTemplate.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          difficulty: true,
          category: true,
          subject: true,
          isSystem: true,
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.emailTemplate.count({ where }),
    ]);

    return { templates, total, page, limit };
  },

  async getById(id: string) {
    const template = await prisma.emailTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundError('Template not found');
    }

    return template;
  },

  async create(data: {
    name: string;
    description: string;
    difficulty: string;
    category: string;
    subject: string;
    fromName: string;
    fromEmail: string;
    body: string;
    ctaText?: string;
    ctaUrl?: string;
    redFlags: string[];
    organizationId?: string;
  }) {
    const template = await prisma.emailTemplate.create({
      data: {
        name: data.name,
        description: data.description,
        difficulty: data.difficulty as any,
        category: data.category as any,
        subject: data.subject,
        fromName: data.fromName,
        fromEmail: data.fromEmail,
        body: data.body,
        ctaText: data.ctaText,
        ctaUrl: data.ctaUrl,
        redFlags: data.redFlags,
        organizationId: data.organizationId,
        isSystem: false,
      },
    });

    return template;
  },

  async update(id: string, data: Partial<{
    name: string;
    description: string;
    difficulty: string;
    category: string;
    subject: string;
    fromName: string;
    fromEmail: string;
    body: string;
    ctaText: string;
    ctaUrl: string;
    redFlags: string[];
  }>) {
    const template = await prisma.emailTemplate.update({
      where: { id },
      data: data as any,
    });

    return template;
  },

  async delete(id: string) {
    await prisma.emailTemplate.delete({
      where: { id },
    });
  },

  async duplicate(id: string, organizationId?: string) {
    const original = await prisma.emailTemplate.findUnique({
      where: { id },
    });

    if (!original) {
      throw new NotFoundError('Template not found');
    }

    const duplicate = await prisma.emailTemplate.create({
      data: {
        name: `${original.name} (Copy)`,
        description: original.description,
        difficulty: original.difficulty,
        category: original.category,
        subject: original.subject,
        fromName: original.fromName,
        fromEmail: original.fromEmail,
        body: original.body,
        ctaText: original.ctaText,
        ctaUrl: original.ctaUrl,
        redFlags: original.redFlags,
        organizationId,
        isSystem: false,
      },
    });

    return duplicate;
  },
};
