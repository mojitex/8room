import { AntigravityExecutor } from "./antigravity.js";
import { BedrockExecutor } from "./bedrock.js";
import { OpenCodeExecutor } from "./opencode.js";
import { OpenCodeConsoleExecutor } from "./opencode-console.js";
import { DefaultExecutor } from "./default.js";

const executors = {
  opencode: new OpenCodeExecutor(),
  "opencode-console": new OpenCodeConsoleExecutor(),
  antigravity: new AntigravityExecutor(),
  bedrock: new BedrockExecutor(),
  br: new BedrockExecutor(),
  "bedrock-xai": new BedrockExecutor("bedrock-xai"),
  brx: new BedrockExecutor("bedrock-xai"),
};

const defaultCache = new Map();

export function getExecutor(provider) {
  if (executors[provider]) return executors[provider];
  if (!defaultCache.has(provider)) defaultCache.set(provider, new DefaultExecutor(provider));
  return defaultCache.get(provider);
}

export function hasSpecializedExecutor(provider) {
  return !!executors[provider];
}

export { BaseExecutor } from "./base.js";
export { AntigravityExecutor } from "./antigravity.js";
export { BedrockExecutor } from "./bedrock.js";
export { DefaultExecutor } from "./default.js";
export { OpenCodeExecutor } from "./opencode.js";
export { OpenCodeZenExecutor, generateSessionId } from "./opencode-zen.js";
