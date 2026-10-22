import { REFRESH_LEAD_MS, OAUTH_ENDPOINTS } from "../config/appConstants.js";

export const TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000;

export function isUnrecoverableRefreshError(result) {
  return (
    result &&
    typeof result === "object" &&
    (result.error === "unrecoverable_refresh_error" ||
      result.error === "refresh_token_reused" ||
      result.error === "invalid_request" ||
      result.error === "invalid_grant")
  );
}

export function getRefreshLeadMs(provider) {
  if (REFRESH_LEAD_MS[provider]) return REFRESH_LEAD_MS[provider];
  return TOKEN_EXPIRY_BUFFER_MS;
}

export function parseVertexSaJson(apiKey) {
  if (typeof apiKey !== "string") return null;
  try {
    const parsed = JSON.parse(apiKey);
    if (parsed.type === "service_account" && parsed.client_email && parsed.private_key && parsed.project_id) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

const vertexTokenCache = new Map();

export async function refreshVertexToken(saJson, log) {
  const cacheKey = saJson.client_email;
  const cached = vertexTokenCache.get(cacheKey);

  if (cached && cached.expiresAt - Date.now() > 5 * 60 * 1000) {
    return { accessToken: cached.token, expiresAt: cached.expiresAt };
  }

  try {
    const { SignJWT, importPKCS8 } = await import("jose");
    log?.debug?.("TOKEN_REFRESH", `Vertex minting token for ${saJson.client_email}`);
    const privateKey = await importPKCS8(saJson.private_key.replace(/\\n/g, "\n"), "RS256");
    const now = Math.floor(Date.now() / 1000);

    const jwt = await new SignJWT({ scope: "https://www.googleapis.com/auth/cloud-platform" })
      .setProtectedHeader({ alg: "RS256" })
      .setIssuer(saJson.client_email)
      .setAudience(OAUTH_ENDPOINTS.google.token)
      .setIssuedAt(now)
      .setExpirationTime(now + 3600)
      .sign(privateKey);

    const res = await fetch(OAUTH_ENDPOINTS.google.token, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      log?.error?.("TOKEN_REFRESH", `Vertex token mint failed: ${err}`);
      return null;
    }

    const { access_token, expires_in } = await res.json();
    const expiresAt = Date.now() + (expires_in ?? 3600) * 1000;

    vertexTokenCache.set(cacheKey, { token: access_token, expiresAt });
    log?.info?.("TOKEN_REFRESH", `Vertex token minted for ${saJson.client_email}`);

    return { accessToken: access_token, expiresAt };
  } catch (error) {
    log?.error?.("TOKEN_REFRESH", `Vertex token error: ${error.message}`);
    return null;
  }
}

export async function refreshWithRetry(refreshFn, maxRetries = 3, log = null) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (attempt > 0) {
      const delay = attempt * 1000;
      log?.debug?.("TOKEN_REFRESH", `Retry ${attempt}/${maxRetries} after ${delay}ms`);
      await new Promise((r) => setTimeout(r, delay));
    }

    try {
      const result = await refreshFn();
      if (result) return result;
    } catch (error) {
      log?.warn?.("TOKEN_REFRESH", `Attempt ${attempt + 1}/${maxRetries} failed: ${error.message}`);
    }
  }

  log?.error?.("TOKEN_REFRESH", `All ${maxRetries} retry attempts failed`);
  return null;
}

const unsupportedRefresh = async () => null;

export const refreshXaiToken = unsupportedRefresh;
export const refreshAccessToken = unsupportedRefresh;
export const refreshKimiToken = unsupportedRefresh;
export const refreshClineToken = unsupportedRefresh;
export const refreshClaudeOAuthToken = unsupportedRefresh;
export const refreshGoogleToken = unsupportedRefresh;
export const refreshCodexToken = unsupportedRefresh;
export const refreshKiroToken = unsupportedRefresh;
export const refreshIflowToken = unsupportedRefresh;
export const refreshGitHubToken = unsupportedRefresh;
export const refreshCopilotToken = unsupportedRefresh;
export const refreshCodebuddyToken = unsupportedRefresh;
export const refreshCodebuddyIntlToken = unsupportedRefresh;
export const refreshTraeToken = unsupportedRefresh;
export const refreshZedToken = unsupportedRefresh;
export const refreshWindsurfToken = unsupportedRefresh;
export const refreshMiniMaxCodeToken = unsupportedRefresh;
export const refreshNousToken = unsupportedRefresh;

export function classifyOAuthRefreshError() {
  return null;
}

export async function getAccessToken(provider, credentials, log) {
  if (!credentials?.refreshToken) {
    log?.warn?.("TOKEN_REFRESH", `No refresh token available for provider: ${provider}`);
  }
  return null;
}

export async function refreshTokenByProvider() {
  return null;
}

export function formatProviderCredentials(provider, credentials) {
  if (!credentials) return null;
  return {
    apiKey: credentials.apiKey,
    accessToken: credentials.accessToken,
    refreshToken: credentials.refreshToken,
    projectId: credentials.projectId,
  };
}

export async function getAllAccessTokens() {
  return {};
}
