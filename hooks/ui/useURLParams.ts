export function useURLParams() {
  const params = new URLSearchParams(window.location.search);
  return Number(params.get("page") || 1);
}
