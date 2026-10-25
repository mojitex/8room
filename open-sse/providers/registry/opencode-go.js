export default {
  id: "opencode-go",
  priority: 210,
  alias: "ocgo",
  uiAlias: "ocgo",
  display: {
    name: "OpenCode Go",
    icon: "terminal",
    color: "#E87040",
    textIcon: "OC",
    website: "https://opencode.ai/auth",
    notice: {
      text: "OpenCode Go subscription: $5/mo (then 10/mo). Access to Kimi, GLM, Qwen, MiMo, MiniMax models.",
      apiKeyUrl: "https://opencode.ai/auth",
    },
  },
  category: "apikey",
  transport: {
    baseUrl: "https://opencode.ai/zen/go/v1/chat/completions",
    headers: {},
    usage: {
      url: "https://opencode.ai/zen/go/v1/usage",
    },
  },
  // Multi-endpoint: pick the transport matching the client sourceFormat to skip
  // translation. Guarded per-model by `supportedFormats` (see chatCore) because
  // opencode-go models differ in endpoint support.
  transports: [
    { format: "openai", baseUrl: "https://opencode.ai/zen/go/v1/chat/completions", auth: { combined: true, header: "Authorization", scheme: "bearer" } },
    { format: "claude", baseUrl: "https://opencode.ai/zen/go/v1/messages", auth: { combined: true, header: "x-api-key", scheme: "raw", anthropicVersion: true } },
    // /responses rejects the Chat-shaped thinking fields (reasoning_effort, thinking:{type}) with
    // 503 "Endpoint is unavailable" (probed live on deepseek-v4.1-flash); it accepts the nested
    // reasoning:{effort,summary} for every model it serves (deepseek-v4*, gpt-*-luna, grok-4.*).
    { format: "openai-responses", baseUrl: "https://opencode.ai/zen/go/v1/responses", auth: { combined: true, header: "Authorization", scheme: "bearer" }, thinkingFormat: "openai-responses" },
  ],
  // supportedFormats follow the endpoint table in https://opencode.ai/docs/go/
  // Models are loaded from the live catalog; family matching supplies protocol metadata.
  models: [],
  // Live catalogue; ids outside this curated list get their endpoint lane from the
  // family regex in providers/models/helpers.js (opencodeFamilyFormats).
  modelsFetcher: { url: "https://opencode.ai/zen/go/v1/models", type: "opencode-go" },
  passthroughModels: true,
  features: {
    usage: true,
    usageApikey: true,
  },
};
