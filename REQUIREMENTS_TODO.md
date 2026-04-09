# Cloudflare Assignment Requirements and Todo

This checklist tracks all requested requirements from the assignment documents and your latest instructions.

## Must-Have Assignment Requirements

- [x] Repository/app naming follows `cf_ai_` prefix convention in project identifiers.
- [x] Include LLM integration (Workers AI, Llama 3.3).
- [x] Include workflow/coordination layer (Worker + Durable Object orchestration).
- [x] Include user input via chat or voice.
- [x] Include memory/state persistence.
- [x] Include additional documentation links.
- [x] Include `README.md` with clear setup/run instructions.
- [x] Include `PROMPTS.md` with human-written prompts used during development.

## Engineering Quality Requirements

- [x] Refactor backend into modular reusable components.
- [x] Separate config, types, routing, service, and durable state logic.
- [x] Add local-dev-safe mode to avoid OAuth/subdomain blockers.
- [x] Keep remote mode available for real Workers AI responses.
- [x] Expose explicit response source (`Workers AI` vs `fallback`) for runtime verification.
- [x] Enforce Cloudflare Access JWT validation in production policy mode.
- [x] Keep UI responsive and structured for maintainability.

## UI and Design Requirements

- [x] Rich premium Cloudflare-inspired visual design.
- [x] Distinct design system with custom variables and atmospheric background.
- [x] Purposeful motion/reveal effects.
- [x] Strong desktop and mobile behavior.
- [x] Polished chat + memory panel presentation.
- [x] Added unique Mission Brief generator to stand out in review.

## Follow-up Submission Tasks (Manual)

- [ ] Ensure actual git repository name starts with `cf_ai_`.
- [ ] Run local demo and record assignment walkthrough.
- [x] Deploy to Cloudflare and include live link in README (optional but recommended).
- [ ] Open PR in your target git instance.
- [x] Provide free-setup prerequisites and onboarding steps in `SETUP_INPUTS_REQUIRED.md`.

Deployed URL:
- https://cf_ai_orbit_concierge.amareshwaranampally.workers.dev
