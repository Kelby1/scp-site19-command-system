import { supabase } from "../lib/supabase";

function isRetryableError(error) {
  if (!error) {
    return false;
  }

  if (error.message === "FOUNDATION_REQUEST_TIMEOUT") {
    return true;
  }

  const retryableCodes = [
    "ECONNRESET",
    "ETIMEDOUT",
    "ECONNREFUSED",
    "NETWORK_ERROR",
  ];

  if (retryableCodes.includes(error.code)) {
    return true;
  }

  const message = String(error.message || "").toLowerCase();

  return (
    message.includes("network") ||
    message.includes("fetch failed") ||
    message.includes("connection reset") ||
    message.includes("temporarily unavailable")
  );
}

function createRequestId() {
  const uuid = typeof crypto !== "undefined" && crypto.randomUUID 
    ? crypto.randomUUID() 
    : Math.random().toString(36).substring(2, 10);
  return `REQ-${Date.now()}-${uuid.slice(0, 8)}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function withTimeout(promise, timeoutMs = 8000) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error("FOUNDATION_REQUEST_TIMEOUT"));
      }, timeoutMs);
    }),
  ]);
}

export const foundationClient = {
  async request(operation, options = {}) {
    const {
      retry = false,
      maxRetries = 2,
      retryDelayMs = 500,
    } = options;

    const requestId = createRequestId();

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await withTimeout(
          operation(supabase),
          8000
        );

        if (result.error) {
          throw result.error;
        }

        return {
          data: result.data,
          error: null,
          requestId,
        };
      } catch (error) {
        const isTimeout =
          error?.message === "FOUNDATION_REQUEST_TIMEOUT";

        const retryable = isRetryableError(error);

const canRetry =
  retry &&
  retryable &&
  attempt < maxRetries;

        console.error(
          `[FOUNDATION][${requestId}][ATTEMPT ${attempt + 1}]`,
          error
        );

        if (canRetry) {
          await sleep(retryDelayMs * (attempt + 1));
          continue;
        }

        return {
          data: null,
          error: {
            code: isTimeout
              ? "FOUNDATION_TIMEOUT"
              : "FOUNDATION_REQUEST_FAILED",

            message: isTimeout
              ? "Foundation request timed out"
              : "Foundation database request failed",

            requestId,
            attempts: attempt + 1,
            originalError: error,
          },
          requestId,
        };
      }
    }
  },
};