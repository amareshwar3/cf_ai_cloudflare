import { AI_MODEL } from "../config";
import type { ChatMessage, Env, MissionBriefResponse } from "../types";

function fallbackBrief(history: ChatMessage[]): MissionBriefResponse {
  const recent = history.slice(-8).map((m) => `${m.role}: ${m.content}`);
  const summary = recent.length > 0 ? recent.join(" ").slice(0, 500) : "No conversation found yet.";

  return {
    summary,
    actions: [
      "Ask a concrete architecture question and include constraints.",
      "Request a step-by-step implementation plan for the top priority feature.",
      "Run one deploy smoke test and record results in README."
    ],
    risks: [
      "Access policy can block reviewers if not configured.",
      "Model fallback mode may hide real LLM behavior in local testing."
    ],
    nextPrompt: "Create a 5-point execution plan for the next 24 hours of this project with code and testing checkpoints.",
    source: "fallback",
    model: "local-fallback"
  };
}

function parseModelJson(text: string): Omit<MissionBriefResponse, "source" | "model"> | null {
  try {
    const parsed = JSON.parse(text) as {
      summary?: unknown;
      actions?: unknown;
      risks?: unknown;
      nextPrompt?: unknown;
    };

    if (typeof parsed.summary !== "string" || typeof parsed.nextPrompt !== "string") {
      return null;
    }

    const actions = Array.isArray(parsed.actions) ? parsed.actions.filter((x) => typeof x === "string") : [];
    const risks = Array.isArray(parsed.risks) ? parsed.risks.filter((x) => typeof x === "string") : [];

    return {
      summary: parsed.summary,
      actions,
      risks,
      nextPrompt: parsed.nextPrompt
    };
  } catch {
    return null;
  }
}

export async function generateMissionBrief(env: Env, history: ChatMessage[]): Promise<MissionBriefResponse> {
  const fallbackEnabled = (env.LOCAL_FALLBACK_MODE ?? "true").toLowerCase() === "true";

  if (!env.AI) {
    return fallbackBrief(history);
  }

  const transcript = history
    .slice(-20)
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const messages = [
    {
      role: "system",
      content:
        "You are a principal AI architect. Return strict JSON with keys: summary (string), actions (string[]), risks (string[]), nextPrompt (string). No markdown."
    },
    {
      role: "user",
      content: `Create a concise mission brief from this conversation:\n${transcript}`
    }
  ];

  try {
    const result = await env.AI.run(AI_MODEL, { messages });
    const text = result?.response?.trim();
    if (text) {
      const parsed = parseModelJson(text);
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
      throw new Error("Mission brief generation failed and fallback mode is disabled.");
    }
  }

  return fallbackBrief(history);
}
