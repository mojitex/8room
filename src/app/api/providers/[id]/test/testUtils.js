import { getProviderConnectionById, updateProviderConnection } from "@/lib/localDb";
import { resolveConnectionProxyConfig } from "@/lib/network/connectionProxy";
import { testProxyUrl } from "@/lib/network/proxyTest";
import { isOpenAICompatibleProvider, isAnthropicCompatibleProvider } from "@/shared/constants/providers";
import { PROVIDERS } from "open-sse/config/providers.js";

const OPENCODE_MODELS_URL = "https://opencode.ai/zen/v1/models";

async function fetchWithConnectionProxy(url, options = {}, effectiveProxy = null) {
  if (!options.signal) {
    options.signal = AbortSignal.timeout(15000);
  }

  if (effectiveProxy?.vercelRelayUrl) {
    const { proxyAwareFetch } = await import("open-sse/utils/proxyFetch.js");
    return proxyAwareFetch(url, options, {
      vercelRelayUrl: effectiveProxy.vercelRelayUrl,
    });
  }

  if (!effectiveProxy?.connectionProxyEnabled || !effectiveProxy?.connectionProxyUrl) {
    return fetch(url, options);
  }

  const { proxyAwareFetch } = await import("open-sse/utils/proxyFetch.js");
  return proxyAwareFetch(url, options, {
    connectionProxyEnabled: true,
    connectionProxyUrl: effectiveProxy.connectionProxyUrl,
    connectionNoProxy: effectiveProxy.connectionNoProxy || "",
  });
}

function resolveValidateUrl(provider) {
  const config = PROVIDERS[provider];
  if (!config) return null;
  if (config.validateUrl) return config.validateUrl;
  const baseUrl = config.baseUrl;
  if (!baseUrl) return null;
  if (baseUrl.endsWith("/chat/completions")) {
    return `${baseUrl.slice(0, -"/chat/completions".length)}/models`;
  }
  return baseUrl.replace(/\/$/, "");
}

async function testApiKeyConnection(connection, effectiveProxy = null) {
  if (isOpenAICompatibleProvider(connection.provider)) {
    const modelsBase = connection.providerSpecificData?.baseUrl;
    if (!modelsBase) return { valid: false, error: "Missing base URL" };
    try {
      const res = await fetchWithConnectionProxy(
        `${modelsBase.replace(/\/$/, "")}/models`,
        { headers: { Authorization: `Bearer ${connection.apiKey}` } },
        effectiveProxy
      );
      return { valid: res.ok, error: res.ok ? null : "Invalid API key or base URL" };
    } catch (err) {
      return { valid: false, error: err.message };
    }
  }

  if (isAnthropicCompatibleProvider(connection.provider)) {
    let modelsBase = connection.providerSpecificData?.baseUrl;
    if (!modelsBase) return { valid: false, error: "Missing base URL" };
    try {
      modelsBase = modelsBase.replace(/\/$/, "");
      if (modelsBase.endsWith("/messages")) modelsBase = modelsBase.slice(0, -9);
      const messageUrl = `${modelsBase}/v1/messages`;
      const model = connection.defaultModel || "claude-3-haiku-20240307";
      const res = await fetchWithConnectionProxy(
        messageUrl,
        {
          method: "POST",
          headers: {
            "x-api-key": connection.apiKey,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
            Authorization: `Bearer ${connection.apiKey}`,
          },
          body: JSON.stringify({
            model,
            max_tokens: 1,
            messages: [{ role: "user", content: "test" }],
          }),
        },
        effectiveProxy
      );
      const valid = res.status !== 401 && res.status !== 403;
      return { valid, error: valid ? null : "Invalid API key or base URL" };
    } catch (err) {
      return { valid: false, error: err.message };
    }
  }

  if (connection.provider === "opencode") {
    try {
      const res = await fetchWithConnectionProxy(
        OPENCODE_MODELS_URL,
        {
          headers: {
            Authorization: "Bearer public",
            "User-Agent": "opencode/1.18.31",
            "x-opencode-client": "desktop",
          },
        },
        effectiveProxy
      );
      return { valid: res.ok, error: res.ok ? null : "OpenCode free tier unavailable" };
    } catch (err) {
      return { valid: false, error: err.message };
    }
  }

  const validateUrl = resolveValidateUrl(connection.provider);
  if (!validateUrl) return { valid: false, error: "Provider test not supported" };

  try {
    const res = await fetchWithConnectionProxy(
      validateUrl,
      { headers: { Authorization: `Bearer ${connection.apiKey}` } },
      effectiveProxy
    );
    return { valid: res.ok, error: res.ok ? null : "Invalid API key" };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

export async function testSingleConnection(id) {
  const connection = await getProviderConnectionById(id);
  if (!connection) return { valid: false, error: "Connection not found", latencyMs: 0, testedAt: new Date().toISOString() };

  const effectiveProxy = await resolveConnectionProxyConfig(connection.providerSpecificData || {});

  if (
    effectiveProxy.connectionProxyEnabled &&
    effectiveProxy.connectionProxyUrl &&
    !effectiveProxy.vercelRelayUrl
  ) {
    const proxyResult = await testProxyUrl({ proxyUrl: effectiveProxy.connectionProxyUrl });
    if (!proxyResult.ok) {
      const proxyError = proxyResult.error || `Proxy test failed with status ${proxyResult.status}`;
      await updateProviderConnection(id, {
        testStatus: "error",
        lastError: proxyError,
        lastErrorAt: new Date().toISOString(),
      });
      return { valid: false, error: proxyError, latencyMs: 0, testedAt: new Date().toISOString() };
    }
  }

  const start = Date.now();
  const result = await testApiKeyConnection(connection, effectiveProxy);
  const latencyMs = Date.now() - start;

  const updateData = {
    testStatus: result.valid ? "active" : "error",
    lastError: result.valid ? null : result.error,
    lastErrorAt: result.valid ? null : new Date().toISOString(),
  };

  await updateProviderConnection(id, updateData);

  return { valid: result.valid, error: result.error, refreshed: false, latencyMs, testedAt: new Date().toISOString() };
}
