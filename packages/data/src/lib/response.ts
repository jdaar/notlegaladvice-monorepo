import { Errors } from "./error.js";

export type Response<T> = {
  isError: true;
  error: {
    message: string,
    code: Errors.Code
  },
} | {
  isError: false,
	data: T,
}

export function ErrorResponse<M extends string>(
  message: M,
  code: Errors.Code,
): Response<never> {
  return {
    isError: true,
    error: { message, code },
  };
}

export function SuccessResponse<T>(
	data: T
): Response<T> {
  return {
    isError: false,
		data
  };
}

