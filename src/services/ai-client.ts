import { AI_MODEL, SYSTEM_PROMPT } from "../config";
import type { ChatMessage, Env } from "../types";

export interface AssistantReply {
  text: string;
  source: "workers-ai" | "fallback";
  model: string;
}

function fallbackResponse(history: ChatMessage[]): AssistantReply {
  const latest = history.at(-1)?.content ?? "";
  return {
    text: [
      "Local fallback mode is active, so no remote LLM call was made.",
      "Your request was captured and persisted in Durable Object memory.",
      `Latest message summary: ${latest.slice(0, 120)}`
    ].join(" "),
    source: "fallback",
    model: "local-fallback"
  };
}

export async function generateAssistantReply(env: Env, history: ChatMessage[]): Promise<AssistantReply> {
  const fallbackEnabled = (env.LOCAL_FALLBACK_MODE ?? "true").toLowerCase() === "true";

  if (!env.AI) {
    return fallbackResponse(history);
  }

  const llmMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.map((m) => ({ role: m.role, content: m.content }))
  ];

  try {
    const result = await env.AI.run(AI_MODEL, { messages: llmMessages });
    if (result?.response && result.response.trim().length > 0) {
      return {
        text: result.response.trim(),
        source: "workers-ai",
        model: AI_MODEL
      };
    }
  } catch {
    if (!fallbackEnabled) {
      throw new Error("Workers AI call failed and fallback mode is disabled.");
    }
  }

  return fallbackResponse(history);
}
