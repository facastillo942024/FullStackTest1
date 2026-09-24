import axios from 'axios';

/**
 * Reads the API base URL. Uses Vite's `import.meta.env` at runtime, but falls
 * back to a relative path so the module also loads under CommonJS (Jest).
 */
export const resolveBaseUrl = (): string => {
  try {
    // `import.meta` only exists in ESM/Vite; guard so Jest (CJS) doesn't break.
    const meta = (
      Function('return typeof import.meta !== "undefined" ? import.meta : undefined')() as
        | { env?: { VITE_API_BASE_URL?: string } }
        | undefined
    );
    return meta?.env?.VITE_API_BASE_URL ?? '/api';
  } catch {
    return '/api';
  }
};

const baseURL = resolveBaseUrl();

export const apiClient = axios.create({
  baseURL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

/** Extracts a human-readable message from an axios error. */
export const extractApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; code?: string }
      | undefined;
    if (data?.message) return data.message;
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Ocurrió un error inesperado';
};
