import type { Env } from "./types";
import { enforceAccessJwt } from "./services/access-auth";
import { getSessionId } from "./utils/session";

export async function routeRequest(request: Request, env: Env): Promise<Response> {
  const blocked = await enforceAccessJwt(request, env);
  if (blocked) {
    return blocked;
  }

  const url = new URL(request.url);

  if (url.pathname.startsWith("/api/")) {
    const sessionId = getSessionId(url);
    const id = env.CHAT_SESSIONS.idFromName(sessionId);
    const stub = env.CHAT_SESSIONS.get(id);

    const rewrittenPath = url.pathname.replace("/api", "") + (url.search || "");
    const target = `https://do${rewrittenPath}${url.search ? "" : `?sessionId=${encodeURIComponent(sessionId)}`}`;
    const doReq = new Request(target, {
      method: request.method,
      headers: request.headers,
      body: request.body
    });

    const doRes = await stub.fetch(doReq);
    const headers = new Headers(doRes.headers);
    headers.set("x-session-id", sessionId);
    return new Response(doRes.body, { status: doRes.status, headers });
  }

  return env.ASSETS.fetch(request);
}
