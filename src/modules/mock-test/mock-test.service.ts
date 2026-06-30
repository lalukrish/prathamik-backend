import { mockTestRepository } from "./mock-test.repository";

export class MockTestService {
  async createMockTest(data: any, userId: string) {
    return mockTestRepository.create({
      title: data.title,
      description: data.description,
      durationMinutes: Number(data.duration), // ← double check this; if your form actually sends `durationMinutes`, use that key instead
      totalMarks: Number(data.totalMarks),
      createdById: userId,
      thumbnail: data.thumbnail,
      category: data.category ?? "OTHER",
      accessMode: data.accessMode ?? "FREE",
      price: data.accessMode === "PAID" ? Number(data.price) : null,
    });
  }

  async getAllMockTests(page = 1, limit = 10) {
    return mockTestRepository.findAll(page, limit);
  }

  async getMockTestById(id: string, userId: string) {
    const [test, enrollment, activePass] = await Promise.all([
      mockTestRepository.findById(id),
      mockTestRepository.findEnrollment(userId, id),
      mockTestRepository.findActiveUserPass(userId),
    ]);

    if (!test) throw new Error("Mock test not found");

    const hasAccess =
      test.accessMode === "FREE" ||
      !!activePass ||
      !!(
        enrollment &&
        (!enrollment.expiresAt || enrollment.expiresAt > new Date())
      );

    return { ...test, hasAccess };
  }

  async updateMockTest(id: string, data: any) {
    const test = await mockTestRepository.findById(id);

    if (!test) {
      throw new Error("Mock test not found");
    }

    return mockTestRepository.update(id, {
      title: data.title,
      description: data.description,
      durationMinutes: data.duration,
    });
  }

  async deleteMockTest(id: string) {
    const test = await mockTestRepository.findById(id);

    if (!test) {
      throw new Error("Mock test not found");
    }

    return mockTestRepository.delete(id);
  }
}

export const mockTestService = new MockTestService();
