export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export class ApiError extends Error {
  message: string;
  status: number;
  data?: Record<string, unknown>;

  constructor(message: string, status: number, data?: Record<string, unknown>) {
    super(message);
    this.message = message;
    this.status = status;
    this.data = data;
    this.name = "ApiError";
  }
}

export type MutationCallbacks<T> = {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
};
