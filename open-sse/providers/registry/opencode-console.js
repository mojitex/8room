export default {
  id: "opencode-console",
  priority: 39,
  alias: "ocapi",
  uiAlias: "ocapi",
  display: {
    name: "OpenCode Console",
    icon: "terminal",
    color: "#E87040",
    textIcon: "OC",
    website: "https://opencode.ai/v2/docs/console/api/inference",
    notice: {
      text: "API key required. Use paid models or an eligible Go subscription; free-tier models cannot be used by external clients.",
      apiKeyUrl: "https://opencode.ai/",
    },
  },
  category: "apikey",
  authType: "apikey",
  authModes: ["apikey"],
  transport: {
    baseUrl: "https://opencode.ai/inference",
    validateUrl: "https://opencode.ai/inference/v1/models",
    timeoutMs: 90000,
  },
  // Curated fallback list; the dashboard can fetch the live catalog using the API key.
  // Free-tier model IDs are intentionally excluded: OpenCode rejects their use by external clients.
  models: [
    { id: "kimi-k3", name: "Kimi K3", targetFormat: "openai", supportedFormats: ["openai"] },
    { id: "glm-5.3", name: "GLM 5.3", targetFormat: "openai", supportedFormats: ["openai"] },
    { id: "glm-5.3-flash", name: "GLM 5.3 Flash", targetFormat: "openai", supportedFormats: ["openai"] },
    { id: "minimax-m3", name: "MiniMax M3", targetFormat: "openai", supportedFormats: ["openai"] },
    { id: "minimax-m2.7", name: "MiniMax M2.7", targetFormat: "openai", supportedFormats: ["openai"] },
    { id: "deepseek-v4.1-flash", name: "DeepSeek V4.1 Flash", targetFormat: "openai", supportedFormats: ["openai"] },
    { id: "deepseek-v4-pro", name: "DeepSeek V4 Pro", targetFormat: "openai", supportedFormats: ["openai"] },
    { id: "claude-sonnet-5-5", name: "Claude Sonnet 5.5", targetFormat: "claude", supportedFormats: ["claude"] },
    { id: "qwen3.8-flash", name: "Qwen 3.8 Flash", targetFormat: "claude", supportedFormats: ["claude"] },
    { id: "qwen3.8-max", name: "Qwen 3.8 Max", targetFormat: "claude", supportedFormats: ["claude"] },
    { id: "gpt-6.1-sol", name: "GPT 6.1 Sol", targetFormat: "openai-responses", supportedFormats: ["openai-responses"] },
    { id: "grok-4.5", name: "Grok 4.5", targetFormat: "openai-responses", supportedFormats: ["openai-responses"] },
    { id: "muse-spark-1.3", name: "Muse Spark 1.3", targetFormat: "openai-responses", supportedFormats: ["openai-responses"] },
    { id: "gemini-4-argon", name: "Gemini 4 Argon", targetFormat: "gemini", supportedFormats: ["gemini"] },
  ],
  passthroughModels: true,
};
