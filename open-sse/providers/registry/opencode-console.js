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
  // The connection-specific models API supplies the live catalog.
  // Keep no bundled list so a stale first entry cannot become an implicit default.
  models: [],
  passthroughModels: true,
};
