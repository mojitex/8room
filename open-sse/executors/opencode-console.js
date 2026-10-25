import { DefaultExecutor } from "./default.js";

// OpenCode Console uses an authenticated API with separate endpoint families.
// OpenCode Free uses a different public-tier executor and must remain untouched.
export class OpenCodeConsoleExecutor extends DefaultExecutor {
  constructor(provider = "opencode-console") {
    super(provider);
  }

  buildUrl(model, stream = true) {
    const base = String(this.config.baseUrl || "https://opencode.ai/inference").replace(/\\/$/, "");
    const clean = String(model || "").replace(/\\([^()]+\\)\\s*$/, "").trim();

    // These paths follow OpenCode's official Console Inference API documentation.
    if (/^(gpt-|grok-|muse[-_]?spark)/i.test(clean)) {
      return `${base}/openai/v1/responses`;
    }
    if (/^claude-/i.test(clean) || /^qwen/i.test(clean)) {
      return `${base}/anthropic/v1/messages`;
    }
    if (/^gemini-/i.test(clean)) {
      const action = stream ? "streamGenerateContent?alt=sse" : "generateContent";
      return `${base}/google/v1beta/models/${encodeURIComponent(clean)}:${action}`;
    }
    return `${base}/openai/v1/chat/completions`;
  }

  buildHeaders(credentials, stream = true, url, model, body = null) {
    const headers = super.buildHeaders(credentials, stream, url, model, body);
    headers["Accept"] = stream ? "text/event-stream" : "application/json";
    return headers;
  }
}
