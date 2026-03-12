const memoryCache = new Map();

function nowMs() {
  return Date.now();
}

function cacheKey(url) {
  return `httpcache:v1:${url}`;
}

export async function fetchJsonCached(url, { ttlMs = 60_000 } = {}) {
  const key = cacheKey(url);

  const inMem = memoryCache.get(key);
  if (inMem && inMem.expiresAt > nowMs()) {
    return inMem.value;
  }

  try {
    const raw = sessionStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.expiresAt > nowMs()) {
        memoryCache.set(key, parsed);
        return parsed.value;
      }
    }
  } catch {
    // ignore storage issues
  }

  const res = await fetch(url, { headers: { "Accept": "application/json" } });
  const contentType = res.headers.get("content-type") || "";

  // Normalize "missing endpoint" into a structured response so UI can degrade gracefully.
  if (res.status === 404) {
    return { __available: false, __status: 404, __url: url };
  }

  if (!res.ok) {
    return { __available: false, __status: res.status, __url: url };
  }

  if (!contentType.includes("application/json")) {
    return { __available: false, __status: 502, __url: url };
  }

  const value = await res.json();
  const record = { value, expiresAt: nowMs() + ttlMs };
  memoryCache.set(key, record);
  try {
    sessionStorage.setItem(key, JSON.stringify(record));
  } catch {
    // ignore quota issues
  }
  return value;
}

