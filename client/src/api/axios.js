import axios from "axios";

const DEFAULT_CANDIDATES = [
  import.meta.env.VITE_API_URL,
  "http://localhost:5001/api",
  "http://localhost:5000/api",
].filter(Boolean);

// Create client with a safe default
const initialBase = DEFAULT_CANDIDATES[0] || "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: initialBase,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

async function detectAndSetBaseURL() {
  for (const candidate of DEFAULT_CANDIDATES) {
    try {
      const url = candidate.replace(/\/+$/, "") + "/health";
      const resp = await axios.get(url, { timeout: 2000 });
      if (resp && (resp.status === 200 || resp.status === 204)) {
        apiClient.defaults.baseURL = candidate;
        return;
      }
    } catch (err) {
      // ignore and try next candidate
    }
  }
}

detectAndSetBaseURL();

export default apiClient;
