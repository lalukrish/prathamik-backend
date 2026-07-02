import { publicRepo } from "./public.repository";

export class PublicService {
  async searchMockTestsPublic(query: string, page: number, limit: number) {
    if (!query || !query.trim()) {
      return publicRepo.findAllPublic(page, limit);
    }
    return publicRepo.searchPublic(query.trim(), page, limit); // fixed typo: searchPubli -> searchPublic
  }
}

export const publicService = new PublicService();
