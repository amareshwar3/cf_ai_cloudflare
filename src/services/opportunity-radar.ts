import { AI_MODEL } from "../config";
import type { ChatMessage, Env, OpportunityRadarResponse } from "../types";

function fallbackRadar(goal: string): OpportunityRadarResponse {
  const normalizedGoal = goal.trim() || "Cloudflare AI Copilot";
  return {
    title: `${normalizedGoal} Radar`,
    pitch: `Build ${normalizedGoal} as a practical AI copilot on Cloudflare that turns user intent into deployable actions with persistent context.`,
    mvpScope: [
      "Chat + voice interface with durable session memory",
      "Mission Brief and Opportunity Radar generation",
      "Access-aware deployment with reviewer-ready docs"
    ],
    roadmap7d: [
      "Day 1-2: Hardening, telemetry, and runtime validation",
      "Day 3-4: Usability polish and guided onboarding",
      "Day 5-6: Demo script, benchmark prompts, and screenshots",
      "Day 7: Final review rehearsal and release"
    ],
    moat: "Strong combination of Cloudflare-native durability, low-latency inference, and execution-focused product UX.",
    source: "fallback",
    model: "local-fallback"
  };
}

function parseRadarJson(text: string): Omit<OpportunityRadarResponse, "source" | "model"> | null {
  try {
    const parsed = JSON.parse(text) as {
      title?: unknown;
      pitch?: unknown;
      mvpScope?: unknown;
      roadmap7d?: unknown;
      moat?: unknown;
    };

    if (typeof parsed.title !== "string" || typeof parsed.pitch !== "string" || typeof parsed.moat !== "string") {
      return null;
    }

    const mvpScope = Array.isArray(parsed.mvpScope) ? parsed.mvpScope.filter((x) => typeof x === "string") : [];
    const roadmap7d = Array.isArray(parsed.roadmap7d) ? parsed.roadmap7d.filter((x) => typeof x === "string") : [];

    return {
      title: parsed.title,
      pitch: parsed.pitch,
      mvpScope,
      roadmap7d,
      moat: parsed.moat
    };
  } catch {
    return null;
  }
}

export async function generateOpportunityRadar(
  env: Env,
  history: ChatMessage[],
  goal: string
): Promise<OpportunityRadarResponse> {
  const fallbackEnabled = (env.LOCAL_FALLBACK_MODE ?? "true").toLowerCase() === "true";

  if (!env.AI) {
    return fallbackRadar(goal);
  }

  const transcript = history
    .slice(-16)
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const messages = [
    {
      role: "system",
      content:
        "You are a startup strategist. Return strict JSON with keys: title (string), pitch (string), mvpScope (string[]), roadmap7d (string[]), moat (string). No markdown."
    },
    {
      role: "user",
      content: `Goal: ${goal || "Cloudflare AI product"}\nConversation:\n${transcript}`
    }
  ];

  try {
    const result = await env.AI.run(AI_MODEL, { messages });
    const text = result?.response?.trim();
    if (text) {
      const parsed = parseRadarJson(text);
      if (parsed) {
        return {
          ...parsed,
          source: "workers-ai",
          model: AI_MODEL
        };
      }
    }
  } catch {
    if (!fallbackEnabled) {
      throw new Error("Opportunity radar generation failed and fallback mode is disabled.");
    }
  }

  return fallbackRadar(goal);
}
