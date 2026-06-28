import { mockTestRepository } from "./mock-test.repository";

export class MockTestService {
  async createMockTest(data: any, userId: string, thumbnail: string) {
    const { title, description, durationMinutes, totalMarks } = data;

    return mockTestRepository.create({
      title: data.title,
      description: data.description,
      durationMinutes: Number(data.durationMinutes),
      totalMarks: Number(data.totalMarks),
      createdById: userId,
      thumbnail: thumbnail,
      category: data.category ?? "OTHER",
      accessMode: data.accessMode ?? "FREE",
      price: data.accessMode === "PAID" ? Number(data.price) : null,
    });
  }

  async getAllMockTests(page = 1, limit = 10) {
    return mockTestRepository.findAll(page, limit);
  }

  async getMockTestById(id: string) {
    const test = await mockTestRepository.findById(id);

    if (!test) {
      throw new Error("Mock test not found");
    }

    return test;
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
