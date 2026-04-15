function getDefaultApiUrl() {
  if (typeof window === 'undefined') {
    return 'http://localhost:8081';
  }

  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:8081`;
}

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || getDefaultApiUrl();
