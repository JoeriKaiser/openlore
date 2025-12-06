export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export class ApiError extends Error {
  constructor(
    public override message: string,
    public status: number,
    public data?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export type MutationCallbacks<T> = {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
};
