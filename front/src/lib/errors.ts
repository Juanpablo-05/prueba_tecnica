import { isAxiosError } from "axios";

export function getApiErrorMessage(
  error: unknown,
  fallback = "No pudimos completar la solicitud.",
) {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message;

    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }

    if (Array.isArray(message)) {
      const normalized = message
        .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
        .join(" ");

      if (normalized) {
        return normalized;
      }
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
}
