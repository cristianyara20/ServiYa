import { PqrsRepository } from "./pqrs.repository";
import { CreatePqrsDTO } from "./types";

export class PqrsService {
  constructor(private repo: PqrsRepository) {}

  async create(data: CreatePqrsDTO): Promise<{ success: boolean; error?: string }> {
    try {
      await this.repo.create(data);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async delete(id: number): Promise<{ success: boolean; error?: string }> {
    try {
      await this.repo.delete(id);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
}
