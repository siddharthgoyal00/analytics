// search.js
// Functions related to building request URLs and fetching observation/session data

/**
 * Construct API URL based on filter type, value, and optional page number
 * @param {string} type - one of "observation","session","config","imaging"
 * @param {string} value - user-entered search string
 * @param {number} [page] - page number for pagination (only for observation-like queries)
 * @returns {string} built URL
 */
export function buildUrl(type, value, page) {
    let url = "";
    const encoded = encodeURIComponent(value);

    if (type === "observation") {
        url = `/api/observation?pattern=${encoded}`;
    } else if (type === "session") {
        url = `/api/session?session_id=${encoded}`;
    } else if (type === "config") {
        url = `/api/observation?config=${encoded}`;
    } else if (type === "imaging") {
        url = `/api/observation?imaging=${encoded}`;
    }

    if (page !== undefined && type !== "session") {
        url += `&page=${page}`;
    }

    // allow paging for session searches as well
    if (page !== undefined && type === "session") {
        url += `&page=${page}`;
    }

    return url;
}

/**
 * Fetch JSON from a given URL and throw on non-OK response
 * @param {string} url
 * @returns {Promise<any>} parsed JSON
 */
export async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("Server error");
    }
    return response.json();
}