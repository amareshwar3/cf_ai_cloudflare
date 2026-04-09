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

export async function enforceAccessJwt(request: Request, env: Env): Promise<Response | null> {
  const mode = (env.ACCESS_POLICY_MODE ?? "off").toLowerCase();
  if (mode !== "enforce") {
    return null;
  }

  const token = request.headers.get("cf-access-jwt-assertion");
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
    await jwtVerify(token, jwks, {
      issuer: teamDomain,
      audience
    });
    return null;
  } catch {
    return new Response("Invalid Cloudflare Access JWT.", { status: 403 });
  }
}
