export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
  ts: number;
}

export interface ChatPayload {
  message: string;
}

export interface AiBinding {
  run: (model: string, input: { messages: Array<{ role: string; content: string }> }) => Promise<{ response?: string }>;
}

export interface Env {
  AI?: AiBinding;
  ASSETS: Fetcher;
  CHAT_SESSIONS: DurableObjectNamespace;
  LOCAL_FALLBACK_MODE?: string;
  ACCESS_POLICY_MODE?: string;
  ACCESS_TEAM_DOMAIN?: string;
  ACCESS_AUD?: string;
}

export interface ChatHistoryResponse {
  messages: ChatMessage[];
  archivedCount: number;
}

export interface ChatResponse {
  response: string;
  messages: ChatMessage[];
  source: "workers-ai" | "fallback";
  model: string;
}

export interface MissionBriefResponse {
  summary: string;
  actions: string[];
  risks: string[];
  nextPrompt: string;
  source: "workers-ai" | "fallback";
  model: string;
}
