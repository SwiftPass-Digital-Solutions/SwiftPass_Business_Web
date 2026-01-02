export interface ResponseBody<T> {
  status: boolean;
  message: string;
  traceId: string;
  data: T;
}
