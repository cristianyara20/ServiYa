export interface ServiceResult<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface IRepository<T, ID, CreateDTO> {
  findAll(): Promise<T[]>;
  findById(id: ID): Promise<T | null>;
  create(data: CreateDTO): Promise<T>;
  update(id: ID, data: Partial<CreateDTO>): Promise<T | null>;
  delete(id: ID): Promise<boolean>;
}

export interface PageResult<T> {
  data: T[];
  count: number;
}

export interface IPaginableRepository<T, Filters> {
  findPaginated(
    page: number,
    pageSize: number,
    filters?: Filters
  ): Promise<PageResult<T>>;
}