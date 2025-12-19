export interface IUser {
  id: string;
  email: string;
  role: string;
  tenantId?: string;
}

export interface ITenant {
  id: string;
  name: string;
  slug: string;
  status: string;
  plan: string;
}

export interface IServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface IPaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface IPaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
