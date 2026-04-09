import type { IRepository, ServiceResult } from "@/lib/interfaces/repository.interface";

import type {
  Reserva,
  CreateReservaDTO
} from "./types";

export class ReservaService {
  constructor(
    private readonly repo: IRepository<Reserva, number, CreateReservaDTO>
  ) {}

  async getAll(): Promise<ServiceResult<Reserva[]>> {
    try {
      const data = await this.repo.findAll();
      return { data, error: null, success: true };
    } catch (err) {
      return { data: null, error: this.handleError(err), success: false };
    }
  }

  async getById(id: number): Promise<ServiceResult<Reserva>> {
    try {
      const data = await this.repo.findById(id);

      if (!data) {
        return {
          data: null,
          error: `Reserva ${id} no encontrada`,
          success: false,
        };
      }

      return { data, error: null, success: true };
    } catch (err) {
      return { data: null, error: this.handleError(err), success: false };
    }
  }

  async create(dto: CreateReservaDTO): Promise<ServiceResult<Reserva>> {
    try {
      // REGLA: fecha agenda obligatoria
      if (!dto.fechaAgenda) {
        return {
          data: null,
          error: "La fecha de agenda es obligatoria",
          success: false,
        };
      }

      const data = await this.repo.create(dto);
      return { data, error: null, success: true };
    } catch (err) {
      return { data: null, error: this.handleError(err), success: false };
    }
  }

  async update(
    id: number,
    updates: Partial<CreateReservaDTO>
  ): Promise<ServiceResult<Reserva>> {
    try {
      const exists = await this.repo.findById(id);
      if (!exists) {
        return {
          data: null,
          error: `Reserva ${id} no encontrada`,
          success: false,
        };
      }

      const data = await this.repo.update(id, updates);
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
        error: deleted ? null : "No se pudo eliminar la reserva",
        success: deleted,
      };
    } catch (err) {
      return { data: false, error: this.handleError(err), success: false };
    }
  }

  private handleError(err: unknown): string {
    if (err instanceof Error) return err.message;
    return "Error en ReservaService";
  }
}