import { FETCH_CONNECT_TIMEOUT_MS } from "../config/runtimeConfig.js";

/**
 * Fetch a provider endpoint with a deadline for receiving response headers.
 * The timer is cleared as soon as fetch resolves, so a long streaming/body read
 * is not cut off by this connection deadline. Parent aborts (client disconnect)
 * are still propagated.
 */
export async function fetchWithProviderTimeout(url, init = {}, timeoutMs = FETCH_CONNECT_TIMEOUT_MS) {
  const controller = new AbortController();
  const parentSignal = init.signal || null;
  const timeout = Number.isInteger(Number(timeoutMs)) && Number(timeoutMs) >= 1000
    ? Number(timeoutMs)
    : FETCH_CONNECT_TIMEOUT_MS;
  const abortFromParent = () => controller.abort(parentSignal.reason || new Error("Request aborted"));
  if (parentSignal?.aborted) abortFromParent();
  else parentSignal?.addEventListener("abort", abortFromParent, { once: true });

  const timer = setTimeout(() => {
    controller.abort(new DOMException(`Upstream did not return response headers within ${timeout}ms`, "TimeoutError"));
  }, timeout);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
    parentSignal?.removeEventListener("abort", abortFromParent);
  }
}
