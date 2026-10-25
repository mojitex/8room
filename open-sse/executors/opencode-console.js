import { DefaultExecutor } from "./default.js";
import { FORMATS } from "../translator/formats.js";

// OpenCode Console has an authenticated /inference/v1 API. Keep this executor
// separate from OpenCode Free, whose public-tier fingerprint and auth are different.
export class OpenCodeConsoleExecutor extends DefaultExecutor {
  constructor() {
    super("opencode-console");
  }

  buildUrl(model, stream, urlIndex = 0, credentials = null) {
    const base = String(this.config.baseUrl || "https://opencode.ai/inference").replace(/\/$/, "");
    const clean = String(model || "").replace(/\([^()]+\)\s*$/, "").trim();
    if (/^(gpt-|grok-|muse[-_]?spark)/i.test(clean)) return `${base}/v1/responses`;
    if (/^claude-/i.test(clean) || /^qwen3\.[5678]-(flash|plus)/i.test(clean)) return `${base}/v1/messages`;
    if (/^gemini-/i.test(clean)) return `${base}/v1/chat/completions`;
    return `${base}/v1/chat/completions`;
  }

  buildHeaders(credentials, stream = true, url, model, body = null) {
    const headers = super.buildHeaders(credentials, stream, url, model, body);
    headers["Accept"] = stream ? "text/event-stream" : "application/json";
    return headers;
  }
}
