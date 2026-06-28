import { subjectRepository } from "./subject.repository";

export class SubjectService {
  async createSubject(name: string) {
    if (!name?.trim()) {
      throw new Error("Subject name is required");
    }

    return subjectRepository.create(name);
  }

  async getAllSubjects() {
    return subjectRepository.getAll();
  }

  async deleteSubject(id: string) {
    return subjectRepository.delete(id);
  }
}

export const subjectService = new SubjectService();
