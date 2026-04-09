export function getSessionId(url: URL): string {
  const incoming = url.searchParams.get("sessionId")?.trim();
  return incoming && incoming.length > 2 ? incoming : crypto.randomUUID();
}
