import prisma from '../utils/database';
import { CampaignStatus } from '@prisma/client';
import { NotFoundError } from '../utils/errors';

export const campaignService = {
  async getAll(filters: { status?: string; search?: string; organizationId?: string; page?: number; limit?: number }) {
    const where: any = {};

    if (filters.organizationId) {
      where.organizationId = filters.organizationId;
    }

    if (filters.status && filters.status !== 'all') {
      where.status = filters.status;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        include: {
          template: {
            select: {
              name: true,
              difficulty: true,
            },
          },
          _count: {
            select: {
              participants: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.campaign.count({ where }),
    ]);

    const campaignsWithStats = await Promise.all(
      campaigns.map(async (campaign: typeof campaigns[number]) => {
        const stats = await prisma.campaignParticipant.aggregate({
          where: { campaignId: campaign.id },
          _count: {
            isEmailOpened: true,
            isLinkClicked: true,
          },
        });

        const participants = campaign._count.participants;
        const openRate = participants > 0 ? (stats._count.isEmailOpened / participants) * 100 : 0;
        const clickRate = participants > 0 ? (stats._count.isLinkClicked / participants) * 100 : 0;

        return {
          ...campaign,
          recipients: participants,
          openRate,
          clickRate,
        };
      })
    );

    return { campaigns: campaignsWithStats, total, page, limit };
  },

  async getById(id: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        template: true,
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                department: true,
              },
            },
          },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundError('Campaign not found');
    }

    return campaign;
  },

  async create(data: {
    name: string;
    description?: string;
    templateId: string;
    recipientIds: string[];
    scheduledAt?: Date;
    organizationId: string;
  }) {
    const campaign = await prisma.campaign.create({
      data: {
        name: data.name,
        description: data.description,
        templateId: data.templateId,
        organizationId: data.organizationId,
        scheduledAt: data.scheduledAt,
        status: data.scheduledAt ? 'SCHEDULED' : 'DRAFT',
        participants: {
          create: data.recipientIds.map((userId) => ({
            userId,
          })),
        },
      },
      include: {
        template: true,
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    return campaign;
  },

  async update(id: string, data: { name?: string; description?: string; status?: CampaignStatus }) {
    const campaign = await prisma.campaign.update({
      where: { id },
      data,
    });

    return campaign;
  },

  async delete(id: string) {
    await prisma.campaign.delete({
      where: { id },
    });
  },

  async launch(id: string) {
    const campaign = await prisma.campaign.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        launchedAt: new Date(),
      },
    });

    await prisma.campaignParticipant.updateMany({
      where: { campaignId: id },
      data: {
        emailSentAt: new Date(),
        isEmailSent: true,
      },
    });

    return campaign;
  },

  async getResults(id: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                department: true,
              },
            },
          },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundError('Campaign not found');
    }

    return campaign;
  },
};