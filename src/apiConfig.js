const localHost = window.location.hostname;
const inferredBaseUrl = localHost && !["localhost", "127.0.0.1"].includes(localHost)
  ? `${window.location.protocol}//${localHost}:8080`
  : "http://localhost:8080";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL !== "http://localhost:8080"
    ? import.meta.env.VITE_API_BASE_URL
    : inferredBaseUrl;

export const getAuthHeaders = (token, includeJson = false) => {
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  if (includeJson) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
};

export const decodeJwt = (token) => {
  if (!token) return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const jsonPayload = decodeURIComponent(
      atob(payload)
        .split("")
        .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.warn("Failed to decode JWT", error);
    return null;
  }
};

export const resolveUserProfileEndpoints = (username, token) => {
  const endpoints = [];

  if (username) {
    endpoints.push(`${API_BASE_URL}/users/${username}`);
  }

  const payload = decodeJwt(token);
  const tokenUsername =
    payload?.uname || payload?.username || payload?.user || payload?.sub;

  if (tokenUsername && tokenUsername !== username) {
    endpoints.push(`${API_BASE_URL}/users/${tokenUsername}`);
  }

  endpoints.push(`${API_BASE_URL}/profile`, `${API_BASE_URL}/users/me`);

  return endpoints.filter(Boolean);
};

// Debug: log resolved API base for runtime troubleshooting
console.log("Resolved API_BASE_URL:", API_BASE_URL);
