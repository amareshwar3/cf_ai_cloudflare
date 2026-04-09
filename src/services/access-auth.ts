import { createRemoteJWKSet, jwtVerify } from "jose";
import type { Env } from "../types";

const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function getJwks(teamDomain: string): ReturnType<typeof createRemoteJWKSet> {
  const existing = jwksCache.get(teamDomain);
  if (existing) {
    return existing;
  }

  const jwks = createRemoteJWKSet(new URL(`${teamDomain}/cdn-cgi/access/certs`));
  jwksCache.set(teamDomain, jwks);
  return jwks;
}

function getTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) {
    return null;
  }

  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.startsWith("CF_Authorization=")) {
      return trimmed.slice("CF_Authorization=".length);
    }
  }

  return null;
}

function parseAudiences(rawAudience: string): string[] {
  return rawAudience
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

export async function enforceAccessJwt(request: Request, env: Env): Promise<Response | null> {
  const mode = (env.ACCESS_POLICY_MODE ?? "off").toLowerCase();
  if (mode !== "enforce") {
    return null;
  }

  const token = request.headers.get("cf-access-jwt-assertion") ?? getTokenFromCookie(request.headers.get("cookie"));
  if (!token) {
    return new Response("Missing Cloudflare Access JWT.", { status: 403 });
  }

  const teamDomain = env.ACCESS_TEAM_DOMAIN?.trim();
  const audience = env.ACCESS_AUD?.trim();

  if (!teamDomain || !audience) {
    return new Response("Access configuration is incomplete.", { status: 500 });
  }

  try {
    const jwks = getJwks(teamDomain);
    const audiences = parseAudiences(audience);

    if (audiences.length === 0) {
      return new Response("Access configuration is incomplete.", { status: 500 });
    }

    for (const aud of audiences) {
      try {
        await jwtVerify(token, jwks, {
          issuer: teamDomain,
          audience: aud
        });
        return null;
      } catch {
        // Keep trying configured audiences.
      }
    }

    return new Response("Invalid Cloudflare Access JWT for configured audience.", { status: 403 });
  } catch {
    return new Response("Invalid Cloudflare Access JWT.", { status: 403 });
  }
}
