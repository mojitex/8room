/**
 * API utility functions for making HTTP requests
 */

const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

/**
 * Make a GET request
 * @param {string} url - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise<object>}
 */
export async function get(url, options = {}) {
  const response = await fetch(url, {
    method: "GET",
    headers: { ...DEFAULT_HEADERS, ...options.headers },
    ...options,
  });
  return handleResponse(response);
}

/**
 * Make a POST request
 * @param {string} url - API endpoint
 * @param {object} data - Request body
 * @param {object} options - Fetch options
 * @returns {Promise<object>}
 */
export async function post(url, data, options = {}) {
  const response = await fetch(url, {
    method: "POST",
    headers: { ...DEFAULT_HEADERS, ...options.headers },
    body: JSON.stringify(data),
    ...options,
  });
  return handleResponse(response);
}

/**
 * Make a PUT request
 * @param {string} url - API endpoint
 * @param {object} data - Request body
 * @param {object} options - Fetch options
 * @returns {Promise<object>}
 */
export async function put(url, data, options = {}) {
  const response = await fetch(url, {
    method: "PUT",
    headers: { ...DEFAULT_HEADERS, ...options.headers },
    body: JSON.stringify(data),
    ...options,
  });
  return handleResponse(response);
}

/**
 * Make a DELETE request
 * @param {string} url - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise<object>}
 */
export async function del(url, options = {}) {
  const response = await fetch(url, {
    method: "DELETE",
    headers: { ...DEFAULT_HEADERS, ...options.headers },
    ...options,
  });
  return handleResponse(response);
}

async function readApiResponse(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    const contentType = response.headers.get("content-type") || "unknown content type";
    const html = /<!doctype html|<html/i.test(text);
    const detail = html
      ? "The server returned an HTML page instead of JSON. Check the API route, reverse proxy, and authentication redirect."
      : text.replace(/\\s+/g, " ").trim().slice(0, 240);
    const error = new Error(`Invalid API response (HTTP ${response.status}; ${contentType}): ${detail}`);
    error.status = response.status;
    throw error;
  }
}

/**
 * Handle API response
 * @param {Response} response - Fetch response
 * @returns {Promise<object>}
 */
async function handleResponse(response) {
  const data = await readApiResponse(response);

  if (!response.ok) {
    const error = new Error(data.error || "An error occurred");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

const api = { get, post, put, del };
export default api;

