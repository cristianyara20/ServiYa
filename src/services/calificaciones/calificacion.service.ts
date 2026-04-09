import type { IRepository, ServiceResult } from "@/lib/interfaces/repository.interface";
import type { Calificacion, CreateCalificacionDTO } from "./types";

export class CalificacionService {
  constructor(
    private readonly repo: IRepository<Calificacion, number, CreateCalificacionDTO>
  ) {}

  async create(dto: CreateCalificacionDTO): Promise<ServiceResult<Calificacion>> {
    try {
      if (dto.puntuacion < 1 || dto.puntuacion > 5) {
        return {
          data: null,
          error: "La puntuación debe estar entre 1 y 5",
          success: false,
        };
      }
      const data = await this.repo.create(dto);
      return { data, error: null, success: true };
    } catch (err) {
      return { data: null, error: this.handleError(err), success: false };
    }
  }

  async delete(id: number): Promise<ServiceResult<boolean>> {
    try {
      const deleted = await this.repo.delete(id);
      return {
        data: deleted,
        error: deleted ? null : "No se pudo eliminar la calificación",
        success: deleted,
      };
    } catch (err) {
      return { data: false, error: this.handleError(err), success: false };
    }
  }

  private handleError(err: unknown): string {
    if (err instanceof Error) return err.message;
    return "Error en CalificacionService";
  }
}