export interface ApiErrorResponse {
  statusCode: number;
  error: string;
  message: string | string[];
  timestamp: string;
  path: string;
}
