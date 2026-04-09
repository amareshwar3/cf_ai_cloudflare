import { ChatSession } from "./durable/chat-session";
import { routeRequest } from "./router";
import type { Env } from "./types";

export { ChatSession };

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    return routeRequest(request, env);
  }
} satisfies ExportedHandler<Env>;
