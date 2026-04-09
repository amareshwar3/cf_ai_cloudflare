import { ACTIVE_MESSAGES_LIMIT, CLEANUP_INTERVAL_MS, MAX_MESSAGES } from "../config";
import { generateAssistantReply } from "../services/ai-client";
import { generateMissionBrief } from "../services/mission-brief";
import type { ChatMessage, ChatPayload, ChatResponse, Env } from "../types";
import { json } from "../utils/http";

export class ChatSession implements DurableObject {
  private readonly state: DurableObjectState;
  private readonly env: Env;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  private async loadMessages(): Promise<ChatMessage[]> {
    const saved = await this.state.storage.get<ChatMessage[]>("messages");
    return Array.isArray(saved) ? saved : [];
  }

  private async saveMessages(messages: ChatMessage[]): Promise<void> {
    await this.state.storage.put("messages", messages.slice(-MAX_MESSAGES));
  }

  private async getArchivedCount(): Promise<number> {
    return (await this.state.storage.get<number>("archivedCount")) ?? 0;
  }

  async alarm(): Promise<void> {
    const existing = await this.loadMessages();
    if (existing.length <= ACTIVE_MESSAGES_LIMIT) {
      return;
    }

    const trimmed = existing.slice(-ACTIVE_MESSAGES_LIMIT);
    const archived = await this.getArchivedCount();
    await this.state.storage.put("archivedCount", archived + (existing.length - trimmed.length));
    await this.saveMessages(trimmed);
  }

  private async handleHistory(): Promise<Response> {
    const messages = await this.loadMessages();
    const archivedCount = await this.getArchivedCount();
    return json({ messages, archivedCount });
  }

  private async handleReset(): Promise<Response> {
    await this.state.storage.deleteAll();
    return json({ ok: true });
  }

  private async handleBrief(): Promise<Response> {
    const history = await this.loadMessages();
    if (history.length === 0) {
      return json({ error: "No conversation found to summarize." }, 400);
    }

    const brief = await generateMissionBrief(this.env, history);
    return json(brief);
  }

  private async handleChat(request: Request): Promise<Response> {
    const body = (await request.json()) as ChatPayload;
    const userMessage = body?.message?.trim();

    if (!userMessage) {
      return json({ error: "Message is required." }, 400);
    }

    const history = await this.loadMessages();
    const userEntry: ChatMessage = { role: "user", content: userMessage, ts: Date.now() };
    const nextHistory = [...history, userEntry];

    let assistantText = "I could not generate a response. Please try again.";
    let source: "workers-ai" | "fallback" = "fallback";
    let model = "local-fallback";
    try {
      const reply = await generateAssistantReply(this.env, nextHistory);
      assistantText = reply.text;
      source = reply.source;
      model = reply.model;
    } catch (error) {
      assistantText = `Model call failed: ${(error as Error).message}`;
    }

    const assistantEntry: ChatMessage = { role: "assistant", content: assistantText, ts: Date.now() };
    const fullHistory = [...nextHistory, assistantEntry];

    await this.saveMessages(fullHistory);
    await this.state.storage.setAlarm(Date.now() + CLEANUP_INTERVAL_MS);

    const response: ChatResponse = {
      response: assistantText,
      messages: fullHistory.slice(-MAX_MESSAGES),
      source,
      model
    };
    return json(response);
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/history") {
      return this.handleHistory();
    }

    if (request.method === "POST" && url.pathname === "/reset") {
      return this.handleReset();
    }

    if (request.method === "POST" && url.pathname === "/chat") {
      return this.handleChat(request);
    }

    if (request.method === "POST" && url.pathname === "/brief") {
      return this.handleBrief();
    }

    return json({ error: "Not found" }, 404);
  }
}
