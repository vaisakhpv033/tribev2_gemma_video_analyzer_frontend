const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// Ensure we don't have a trailing slash for consistent endpoint joining
export const API_BASE_URL = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
