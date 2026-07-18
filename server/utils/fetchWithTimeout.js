import { AppError } from "./AppError.js";

export async function fetchWithTimeout(url, options, timeoutMs = 20_000) {
  try {
    return await fetch(url, { ...options, signal: AbortSignal.timeout(timeoutMs) });
  } catch (error) {
    if (error.name === "TimeoutError") {
      throw new AppError("The crop check timed out. Please retry.", 504);
    }
    throw new AppError("Could not reach a crop diagnosis service. Please retry.", 502);
  }
}
