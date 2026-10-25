import opencodeConsole from "./opencode-console.js";

export default {
  ...opencodeConsole,
  id: "opencode-go",
  priority: 38,
  alias: "ocgo",
  uiAlias: "ocgo",
  display: {
    ...opencodeConsole.display,
    name: "OpenCode Go",
    notice: {
      text: "OpenCode Go subscription required. Use a key from the subscribed workspace.",
      apiKeyUrl: "https://opencode.ai/",
    },
  },
  transport: {
    ...opencodeConsole.transport,
    baseUrl: "https://opencode.ai/inference/go",
    // The model catalog endpoint is shared by Console and Go.
    validateUrl: "https://opencode.ai/inference/v1/models",
  },
  models: [...opencodeConsole.models],
};
