import prisma from '../utils/database';
import { NotFoundError } from '../utils/errors';

export const quizService = {
  async getAll(filters: { category?: string; difficulty?: string; page?: number; limit?: number }) {
    const where: any = {};

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.difficulty) {
      where.difficulty = filters.difficulty;
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const [quizzes, total] = await Promise.all([
      prisma.quiz.findMany({
        where,
        include: {
          _count: {
            select: {
              questions: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.quiz.count({ where }),
    ]);

    return { quizzes, total, page, limit };
  },

  async getById(id: string) {
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundError('Quiz not found');
    }

    return quiz;
  },

  async create(data: {
    title: string;
    description?: string;
    difficulty: string;
    category: string;
    timeLimit?: number;
    passingScore?: number;
    questions: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
      explanation?: string;
      order: number;
    }>;
  }) {
    const quiz = await prisma.quiz.create({
      data: {
        title: data.title,
        description: data.description,
        difficulty: data.difficulty as any,
        category: data.category as any,
        timeLimit: data.timeLimit,
        passingScore: data.passingScore || 70,
        questions: {
          create: data.questions,
        },
      },
      include: {
        questions: true,
      },
    });

    return quiz;
  },

  async submitQuiz(quizId: string, userId: string, data: { answers: Record<string, number>; timeSpent: number }) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: true,
      },
    });

    if (!quiz) {
      throw new NotFoundError('Quiz not found');
    }

    let correctCount = 0;
    quiz.questions.forEach((question) => {
      const userAnswer = data.answers[question.id];
      if (userAnswer === question.correctAnswer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;

    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        userId,
        answers: data.answers,
        score,
        timeSpent: data.timeSpent,
        passed,
        completedAt: new Date(),
      },
    });

    return {
      attempt,
      score,
      passed,
      correctCount,
      totalQuestions: quiz.questions.length,
    };
  },

  async getAttempts(userId: string) {
    const attempts = await prisma.quizAttempt.findMany({
      where: { userId },
      include: {
        quiz: {
          select: {
            title: true,
            difficulty: true,
            category: true,
          },
        },
      },
      orderBy: { completedAt: 'desc' },
    });

    return attempts;
  },

  async getAttemptById(id: string) {
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id },
      include: {
        quiz: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundError('Quiz attempt not found');
    }

    return attempt;
  },
};
