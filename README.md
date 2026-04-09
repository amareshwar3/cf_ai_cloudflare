# cf_ai_orbit_concierge

AI-powered Cloudflare application with a premium chat + voice interface, LLM responses via Workers AI (Llama 3.3), Durable Object memory, and coordinated Worker/DO execution.

## Live App

- https://cf_ai_orbit_concierge.amareshwaranampally.workers.dev

## Security Policy Decision

This project keeps Cloudflare Access enabled and validates Access JWTs in the Worker.

- Policy mode: `enforce`
- Token header verified: `cf-access-jwt-assertion`
- Team domain and audience validation configured via environment variables
- JWKs fetched dynamically from Cloudflare Access cert endpoint

## Unique Add-on: Mission Brief Engine

The app includes a reviewer-friendly feature: `Generate Mission Brief`.

- Generates a summary from the ongoing conversation
- Produces actionable steps and key risks
- Suggests a strong next prompt for execution
- Shows source telemetry (`workers-ai` or `fallback`)

## New Feature: Opportunity Radar

The app now includes `Generate Opportunity Radar`, a product strategy generator built for standout demos.

- Generates a product title and investment-style pitch
- Produces MVP scope bullets for immediate implementation
- Produces a practical 7-day roadmap
- Extracts a moat statement to sharpen product positioning
- Includes source/model telemetry for runtime trust

## Assignment Requirement Coverage

- LLM: Uses Cloudflare Workers AI with `@cf/meta/llama-3.3-70b-instruct-fp8-fast` through `src/services/ai-client.ts`.
- Workflow / coordination: Uses Cloudflare Worker routing + Durable Object orchestration and scheduled cleanup (`alarm`) for lifecycle coordination.
- User input via chat or voice: Includes both text chat and browser voice input (Web Speech API) in `public/app.js`.
- Memory or state: Durable Object stores chat history and archived count in persistent storage.
- Additional documentation: See linked docs in the Resources section.

## Tech Stack

- Cloudflare Workers
- Cloudflare Workers AI (no external API keys required)
- Durable Objects (SQLite-backed class)
- Static frontend via Worker Assets
- Vanilla HTML/CSS/JS (premium custom UI)

## Local Run Instructions

1. Install dependencies:

```bash
npm install
```

2. Start local dev server:

```bash
npm run dev
```

3. Open the local URL shown by Wrangler and test:
- Send chat messages.
- Use Voice button to dictate text.
- Refresh and confirm memory persists for same session.
- Click Clear Memory to reset the current session.

Note: local mode can use fallback responses when authentication/runtime constraints prevent remote inference. The UI now shows `LLM source` so reviewers can verify `Workers AI` vs `Fallback` in real time.

## Remote Workers AI Mode

Use this when you want real Llama 3.3 inference responses:

```bash
npx wrangler login
npm run dev:remote
```

If Wrangler asks for a workers.dev subdomain, register it once in Cloudflare dashboard onboarding.

Verification tip: send a prompt and check the sidebar `LLM source`. For real model inference it should display `Workers AI (@cf/meta/llama-3.3-70b-instruct-fp8-fast)`.

## Deploy

```bash
npm run deploy
```

After deploy, open the Worker URL and test the same flows.

Current deployed URL:
- https://cf_ai_orbit_concierge.amareshwaranampally.workers.dev

## Project Structure

- `src/index.ts`: Worker entrypoint and exports.
- `src/router.ts`: HTTP routing between API and static assets.
- `src/durable/chat-session.ts`: Stateful chat domain logic in Durable Object.
- `src/services/ai-client.ts`: Workers AI integration + local fallback policy.
- `src/services/access-auth.ts`: Cloudflare Access JWT validation middleware.
- `src/services/mission-brief.ts`: Mission brief generation service.
- `src/services/opportunity-radar.ts`: Product strategy and opportunity mapping service.
- `src/utils/http.ts`: Shared JSON response helper.
- `src/utils/session.ts`: Session identity helper.
- `src/config.ts`: Shared constants and prompt configuration.
- `src/types.ts`: Centralized type contracts.
- `public/index.html`: Premium Cloudflare-style interface.
- `public/styles.css`: Rich visual design, motion, responsive layout.
- `public/app.js`: Chat + voice UX and API integration.
- `PROMPTS.md`: Human-written AI prompts used during development.
- `REQUIREMENTS_TODO.md`: Requirement traceability and completion checklist.
- `SETUP_INPUTS_REQUIRED.md`: Exact free account/setup inputs needed from user.

## Environment Setup

- `.dev.vars` stores local-only secrets and personal setup values.
- `.dev.vars` is ignored by git.
- `.dev.vars.example` provides a safe template without secrets.

## Important Submission Note

Your repository must be named with prefix `cf_ai_` to qualify.
This project already uses that naming convention in app/package identifiers (`cf_ai_orbit_concierge`).
If your git repository name is different, rename it before submission (for example: `cf_ai_orbit_concierge`).

## Additional Cloudflare Documentation

- Agents overview: https://developers.cloudflare.com/agents/index.md
- Agents full docs (single file): https://developers.cloudflare.com/agents/llms-full.txt
- Agents API reference: https://developers.cloudflare.com/agents/api-reference/agents-api/index.md
- Store and sync state: https://developers.cloudflare.com/agents/api-reference/store-and-sync-state/index.md
- Using AI models: https://developers.cloudflare.com/agents/api-reference/using-ai-models/index.md
- Durable Objects docs: https://developers.cloudflare.com/durable-objects/
- Workers AI docs: https://developers.cloudflare.com/workers-ai/
- Workflows docs: https://developers.cloudflare.com/workflows/

## Notes on Keys / Cost

- Default path is keyless for model use through Cloudflare Workers AI binding (`[ai] binding = "AI"`).
- Voice input uses browser-native Web Speech API and does not require external keys.

## Reviewer Demo Flow (Suggested)

1. Send 2-3 chat messages describing a product idea and constraints.
2. Generate `Mission Brief` and show summary/actions/risks.
3. Generate `Opportunity Radar` and show pitch + MVP + roadmap.
4. Show LLM source telemetry (`workers-ai` or `fallback`) in UI.
5. Demonstrate persistent memory by refreshing and reloading session context.

