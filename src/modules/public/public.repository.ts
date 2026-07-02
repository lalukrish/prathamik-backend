import { prisma } from "../../config/db";
import { Prisma, ExamCategory } from "@prisma/client";

export class PublicRepo {
  async findAllPublic(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const where: Prisma.MockTestWhereInput = {
      isPublished: true,
    };

    const [data, total] = await Promise.all([
      prisma.mockTest.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          durationMinutes: true,
          totalMarks: true,
          thumbnailUrl: true,
          category: true,
          accessMode: true,
          price: true,
          createdAt: true,
          _count: { select: { questions: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.mockTest.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async searchPublic(query: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const q = query.toLowerCase();

    const directMatches = Object.values(ExamCategory).filter((c) =>
      c.toLowerCase().includes(q),
    );

    const synonymMap: Record<string, ExamCategory[]> = {
      sbi: ["IBPS"],
      bank: ["IBPS"],
      banking: ["IBPS"],
      railway: ["RRB"],
      medical: ["NEET"],
      engineering: ["JEE"],
      civil: ["UPSC"],
    };
    const synonymMatches = Object.entries(synonymMap)
      .filter(([alias]) => alias.includes(q) || q.includes(alias))
      .flatMap(([, categories]) => categories);

    const matchingCategories = Array.from(
      new Set([...directMatches, ...synonymMatches]),
    );

    const where: Prisma.MockTestWhereInput = {
      isPublished: true,
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        ...(matchingCategories.length > 0
          ? [{ category: { in: matchingCategories } }]
          : []),
      ],
    };

    const [data, total] = await Promise.all([
      prisma.mockTest.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          durationMinutes: true,
          totalMarks: true,
          thumbnailUrl: true,
          category: true,
          accessMode: true,
          price: true,
          createdAt: true,
          _count: { select: { questions: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.mockTest.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}

// export a singleton instance, not the class itself
export const publicRepo = new PublicRepo();
