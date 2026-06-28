import { prisma } from "../../config/db";

export class MockTestRepository {
  async create(data: {
    title: string;
    description?: string;
    durationMinutes: number;
    totalMarks: number;
    createdById: string;
    thumbnail?: string;
    category: string;
    accessMode: string;
    price?: number | null;
  }) {
    return prisma.mockTest.create({
      data: {
        title: data.title,
        description: data.description,
        durationMinutes: data.durationMinutes,
        totalMarks: data.totalMarks,
        createdById: data.createdById,
        thumbnailUrl: data.thumbnail,
        category: data.category as any,
        accessMode: data.accessMode as any,
        price: data.price,
      },
    });
  }
  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.mockTest.findMany({
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              questions: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.mockTest.count(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string) {
    return prisma.mockTest.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });
  }

  async update(
    id: string,
    data: {
      title?: string;
      description?: string;
      durationMinutes?: number;
    },
  ) {
    return prisma.mockTest.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.mockTest.delete({
      where: { id },
    });
  }
}

export const mockTestRepository = new MockTestRepository();
