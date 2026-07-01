// import { prisma } from "../../config/db";

// export class MockTestRepository {
//   async create(data: {
//     title: string;
//     description?: string;
//     durationMinutes: number;
//     totalMarks: number;
//     createdById: string;
//     thumbnail?: string;
//     category: string;
//     accessMode: string;
//     price?: number | null;
//   }) {
//     return prisma.mockTest.create({
//       data: {
//         title: data.title,
//         description: data.description,
//         durationMinutes: data.durationMinutes,
//         totalMarks: data.totalMarks,
//         createdById: data.createdById,
//         thumbnailUrl: data.thumbnail,
//         category: data.category as any,
//         accessMode: data.accessMode as any,
//         price: data.price,
//       },
//     });
//   }
//   async findAll(page: number, limit: number) {
//     const skip = (page - 1) * limit;

//     const [data, total] = await Promise.all([
//       prisma.mockTest.findMany({
//         skip,
//         take: limit,
//         include: {
//           _count: {
//             select: {
//               questions: true,
//             },
//           },
//           createdBy: {
//             select: {
//               id: true,
//               name: true,
//             },
//           },
//         },
//         orderBy: {
//           createdAt: "desc",
//         },
//       }),

//       prisma.mockTest.count(),
//     ]);

//     return {
//       data,
//       total,
//       page,
//       limit,
//       totalPages: Math.ceil(total / limit),
//     };
//   }

//   async findById(id: string) {
//     return prisma.mockTest.findUnique({
//       where: { id },
//       include: {
//         questions: {
//           include: {
//             options: true,
//           },
//         },
//       },
//     });
//   }
//   async findEnrollment(userId: string, mockTestId: string) {
//     return prisma.userTestEnrollment.findUnique({
//       where: { userId_mockTestId: { userId, mockTestId } },
//     });
//   }

//   async findActiveUserPass(userId: string) {
//     return prisma.userPass.findFirst({
//       where: {
//         userId,
//         status: "ACTIVE",
//         OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
//       },
//     });
//   }
//   async update(
//     id: string,
//     data: {
//       title?: string;
//       description?: string;
//       durationMinutes?: number;
//     },
//   ) {
//     return prisma.mockTest.update({
//       where: { id },
//       data,
//     });
//   }

//   async delete(id: string) {
//     return prisma.mockTest.delete({
//       where: { id },
//     });
//   }
//  async search(query: string, page: number, limit: number) {
//   const skip = (page - 1) * limit;

//   const matchingCategories = Object.values(ExamCategory).filter((c) =>
//     c.toLowerCase().includes(query.toLowerCase())
//   );

//   const where: Prisma.MockTestWhereInput = {
//     OR: [
//       { title: { contains: query, mode: "insensitive" } },
//       { description: { contains: query, mode: "insensitive" } },
//       ...(matchingCategories.length > 0
//         ? [{ category: { in: matchingCategories } }]
//         : []),
//     ],
//   };

//   const [data, total] = await Promise.all([
//     prisma.mockTest.findMany({
//       where,
//       skip,
//       take: limit,
//       include: {
//         _count: {
//           select: {
//             questions: true,
//           },
//         },
//         createdBy: {
//           select: {
//             id: true,
//             name: true,
//           },
//         },
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     }),

//     prisma.mockTest.count({ where }),
//   ]);

//   return {
//     data,
//     total,
//     page,
//     limit,
//     totalPages: Math.ceil(total / limit),
//   };
// }
// }

// export const mockTestRepository = new MockTestRepository();

import { prisma } from "../../config/db";
import { Prisma, ExamCategory } from "@prisma/client";

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
          _count: { select: { questions: true } },
          createdBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.mockTest.count(),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    return prisma.mockTest.findUnique({
      where: { id },
      include: {
        questions: { include: { options: true } },
      },
    });
  }

  async findEnrollment(userId: string, mockTestId: string) {
    return prisma.userTestEnrollment.findUnique({
      where: { userId_mockTestId: { userId, mockTestId } },
    });
  }

  async findActiveUserPass(userId: string) {
    return prisma.userPass.findFirst({
      where: {
        userId,
        status: "ACTIVE",
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });
  }

  async update(
    id: string,
    data: { title?: string; description?: string; durationMinutes?: number },
  ) {
    return prisma.mockTest.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.mockTest.delete({ where: { id } });
  }

  async search(query: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const q = query.toLowerCase();

    // Direct enum-name matches (e.g. "ssc" -> SSC, "ups" -> UPSC)
    const directMatches = Object.values(ExamCategory).filter((c) =>
      c.toLowerCase().includes(q),
    );

    // Common synonyms/aliases that don't literally appear in the enum
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
        include: {
          _count: { select: { questions: true } },
          createdBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.mockTest.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}

export const mockTestRepository = new MockTestRepository();
