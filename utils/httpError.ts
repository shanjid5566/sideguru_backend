export type HttpError = Error & { statusCode: number; status: number };

export const createHttpError = (statusCode: number, message: string): HttpError => {
  const error = new Error(message) as HttpError;
  error.statusCode = statusCode;
  error.status = statusCode;
  return error;
};
