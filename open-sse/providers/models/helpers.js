import { FORMATS } from "../../translator/formats.js";

// Codex auto-generates a "-review" variant for each llm model (review quota family)
export const CODEX_REVIEW_SUFFIX = "-review";

export function withCodexReviewModels(models) {
  return models.flatMap((model) => {
    if ((model.kind || model.type || "llm") !== "llm" || model.id.endsWith(CODEX_REVIEW_SUFFIX)) {
      return [model];
    }
    return [
      model,
      {
        ...model,
        id: `${model.id}${CODEX_REVIEW_SUFFIX}`,
        name: `${model.name} Review`,
        upstreamModelId: model.upstreamModelId || model.id,
        quotaFamily: "review"
      }
    ];
  });
}

export function isMuseSparkModel(modelId) {
  if (!modelId || typeof modelId !== "string") return false;
  const clean = modelId.replace(/\([^()]+\)\s*$/, "").trim();
  const base = clean.includes("/") ? clean.split("/").pop() : clean;
  return /^muse[-_]?spark(?:$|[-_:.\s])/i.test(base);
}

// "model(level)" is a monsmain thinking override; strip before matching.
// Accepts both bare ids ("deepseek-v4-pro(max)") and provider-prefixed ones.
export function isDeepSeekModel(modelId) {
  if (!modelId || typeof modelId !== "string") return false;
  const clean = modelId.replace(/\([^()]+\)\s*$/, "").trim();
  const base = clean.includes("/") ? clean.split("/").pop() : clean;
  return /^deepseek-/i.test(base);
}

// OpenCode Zen free-tier ids all carry the "-free" suffix (e.g.
// "mimo-v2.6-flash-free", "muse-spark-1.3-contributor-free"). Upstream gates
// these behind the attested free-tier identity even on the keyed lane, so the
// executor must detect them to switch auth instead of hardcoding a model list.
export function isOpencodeFreeTierModel(modelId) {
  if (!modelId || typeof modelId !== "string") return false;
  const clean = modelId.replace(/\([^()]+\)\s*$/, "").trim();
  const base = clean.includes("/") ? clean.split("/").pop() : clean;
  return /-free$/i.test(base);
}

// Endpoint families for OpenCode models outside the curated registry (modelsFetcher /
// passthrough ids) — regex keeps auto-fetched models on the right endpoint:
// /responses (gpt/grok/muse-spark), /messages (minimax/qwen), /chat/completions (rest).
// Curated registry entries always win; this is the unknown-id fallback only.
const OPENCODE_FAMILIES = [
  // OpenCode Free and Go use source-format-matched transports when a model exposes them.
  { match: /^(grok|gpt|muse[-_]?spark)/i, supportedFormats: [FORMATS.OPENAI_RESPONSES], targetFormat: FORMATS.OPENAI_RESPONSES },
  { match: /^deepseek-v4(?:\.1)?-(pro|flash)/i, supportedFormats: [FORMATS.OPENAI, FORMATS.CLAUDE, FORMATS.OPENAI_RESPONSES] },
  { match: /^(minimax|qwen|space-bunny)/i, supportedFormats: [FORMATS.OPENAI, FORMATS.CLAUDE] },
  { match: /^claude-/i, supportedFormats: [FORMATS.CLAUDE], targetFormat: FORMATS.CLAUDE },
  { match: /^gemini-/i, supportedFormats: [FORMATS.GEMINI], targetFormat: FORMATS.GEMINI },
  { match: /^(kimi|glm|deepseek|nemotron|longcat)/i, supportedFormats: [FORMATS.OPENAI], targetFormat: FORMATS.OPENAI },
];

// Console endpoint families differ from OpenCode Free/Go: choose one official API
// family based on the model ID, while Free/Go may honor the client's source format.
const OPENCODE_CONSOLE_FAMILIES = [
  { match: /^(grok|gpt|muse[-_]?spark)/i, supportedFormats: [FORMATS.OPENAI_RESPONSES], targetFormat: FORMATS.OPENAI_RESPONSES },
  { match: /^claude-/i, supportedFormats: [FORMATS.CLAUDE], targetFormat: FORMATS.CLAUDE },
  { match: /^qwen/i, supportedFormats: [FORMATS.CLAUDE], targetFormat: FORMATS.CLAUDE },
  { match: /^gemini-/i, supportedFormats: [FORMATS.GEMINI], targetFormat: FORMATS.GEMINI },
  { match: /^deepseek-v4(?:\.1)?-(pro|flash)/i, supportedFormats: [FORMATS.OPENAI], targetFormat: FORMATS.OPENAI },
  { match: /^(kimi|glm|minimax|deepseek|nemotron|longcat)/i, supportedFormats: [FORMATS.OPENAI], targetFormat: FORMATS.OPENAI },
];

export function opencodeFamilyFormats(modelId, aliasOrId = "") {
  if (!modelId || typeof modelId !== "string") return null;
  const base = modelId.replace(/\([^()]+\)\s*$/, "").trim();
  const isConsole = ["ocapi", "opencode-console"].includes(aliasOrId);
  const families = isConsole ? OPENCODE_CONSOLE_FAMILIES : OPENCODE_FAMILIES;
  return families.find((f) => f.match.test(base)) || null;
}
