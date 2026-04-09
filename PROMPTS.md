# PROMPTS.md

Human-written prompts used to guide AI-assisted development.

## Product + Architecture Prompts

1. "Design an AI-powered Cloudflare app that is realistic for an assignment review: include Workers AI (Llama 3.3), Durable Objects for per-session memory, and a clean API surface for chat, history, and reset."
2. "Propose a resilient Worker architecture where the Worker coordinates requests and Durable Objects own stateful chat sessions; include a cleanup strategy for long-lived sessions."
3. "Generate a concise system prompt for an assistant called Orbit Concierge that sounds premium, practical, and business-technical without being verbose."

## UI / UX Prompts

4. "Create a premium Cloudflare-inspired UI language: warm orange highlights, deep atmospheric background, expressive typography, and subtle reveal motion that feels intentional."
5. "Build a responsive chat experience with a memory side panel that exposes stored message counts and archived state so reviewers can verify persistence behavior quickly."
6. "Implement browser voice input so users can dictate a message into chat with graceful fallback when speech recognition is unavailable."

## Quality + Submission Prompts

7. "Write a README that maps each assignment requirement to exact implementation details and includes clear local and deploy run instructions."
8. "List authoritative Cloudflare documentation links in markdown form so reviewers can validate platform usage quickly."
9. "Review the project against assignment constraints and identify any submission blockers, especially repository naming and required documentation files."

## Optional Demo Prompts

10. "Craft five demo questions that showcase memory, architecture reasoning, and Cloudflare product guidance in under two minutes."
11. "Suggest a short live demo script where I show chat input, voice input, persisted history on refresh, and memory reset."
12. "Generate reviewer-friendly acceptance checks I can run before submitting the repository."
