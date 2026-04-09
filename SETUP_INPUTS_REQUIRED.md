# What You Need to Provide (Free Setup)

This file lists exactly what I need from you to run full real LLM mode and complete submission.

Known account details provided:
- Account ID: `5368ab85f5ddfdf93a0ebd096283e6e8`
- Target repository: `https://github.com/amareshwar3/cf_ai_cloudflare`

## A) Required (Free)

1. Cloudflare account login access (free plan).
2. One-time workers.dev subdomain registration in your Cloudflare dashboard.
3. Authorization in local terminal via `npx wrangler login`.

These three are enough for real Workers AI calls on free limits in dev/deploy.

## B) Optional but Helpful

1. Cloudflare Account ID (for explicit deployment targeting if needed).
2. Cloudflare API Token (only needed for CI or non-interactive deploys).
3. A target git repository URL named with `cf_ai_` prefix.

Status right now:
- Account ID is already provided.
- Repository URL is already provided and naming is correct (`cf_ai_...`).
- API token is optional for local interactive deploys, but recommended.

## C) Step-by-Step: How to Get Each Item

### 1) Cloudflare login
- Go to https://dash.cloudflare.com/
- Create/sign in to your account (free plan is fine).

### 2) Register workers.dev subdomain (one-time)

Detailed walkthrough:
1. Open `https://dash.cloudflare.com/` and sign in.
2. In the top-right account selector, ensure you are on the account with ID `5368ab85f5ddfdf93a0ebd096283e6e8`.
3. In the left sidebar, click **Workers & Pages**.
4. If you see an onboarding screen, click **Get started** or **Create application**.
5. Look for a prompt like "Choose your `workers.dev` subdomain".
6. Enter a unique subdomain name (example: `amaresh-ai-labs`).
7. Cloudflare will show full hostname preview: `amaresh-ai-labs.workers.dev`.
8. Click **Save**, **Register**, or **Continue** (button text can vary).
9. Wait for confirmation screen that your subdomain is active.
10. If you cannot find onboarding, directly open:
	- `https://dash.cloudflare.com/<your-account-id>/workers/onboarding`
	- Replace `<your-account-id>` with `5368ab85f5ddfdf93a0ebd096283e6e8`

How to verify subdomain is registered:
- Go to **Workers & Pages** dashboard.
- Create/open any Worker and check if URL ends with `<your-subdomain>.workers.dev`.
- If yes, onboarding is complete.

### 3) Authorize Wrangler in terminal
- Run:

```bash
npx wrangler login
```

- Approve in browser.

Tip:
- Keep the same Cloudflare account selected in browser while approving.
- After successful login, run `npx wrangler whoami` to confirm account context.

### 4) Run real LLM dev mode
- In project folder run:

```bash
npm run dev:remote
```

- If it starts successfully, chat responses should show `Workers AI` in UI under `LLM source`.

If you still see fallback:
1. Stop dev server and run `npx wrangler whoami`.
2. Ensure account is the same one with registered `workers.dev` subdomain.
3. Start remote mode again: `npm run dev:remote`.
4. Send a new chat message and check `LLM source`.

### 5) Deploy
- Run:

```bash
npm run deploy
```

Expected successful output:
- Worker deployed URL
- Route on `<your-subdomain>.workers.dev`

If deploy asks account/resource confirmation, select account with ID `5368ab85f5ddfdf93a0ebd096283e6e8`.

## E) Which API Token Template to Choose (Answer to your question)

Short answer:
- Choose **Create Custom Token**.
- Do **not** use `Read all resources`.

Important update for your current setup:
- Since you connected GitHub Worker Builds and already see `API token: cfai build token`, Cloudflare has already created and attached a valid build token for you.
- In this case, you usually do **not** need to create another token manually.

Why custom token:
- Templates are often broader than needed or omit AI-specific actions.
- Custom token gives minimum required permissions and is safer.

Recommended minimum token permissions:
1. **Account** -> **Workers Scripts Edit**
2. **Account** -> **Workers AI Edit**
3. **Account** -> **Account Settings Read**

Depending on dashboard/API token flow, you may also see these auto-added permissions (normal for Builds):
- **Zone** -> **Workers Routes Edit**
- **User** -> **User Details Read**
- **User** -> **Memberships Read**

Resource scope:
- **Include** -> **Account** -> select only your account (`5368ab85f5ddfdf93a0ebd096283e6e8`).

If you cannot find old label names:
- Cloudflare renamed/grouped several permission labels.
- Use the exact names above (`Workers Scripts Edit`, `Workers AI Edit`, `Account Settings Read`).

Token creation steps:
1. Open **My Profile** -> **API Tokens**.
2. Click **Create Token**.
3. Click **Create Custom Token**.
4. Add permissions listed above.
5. Set account resource to your account only.
6. (Optional) Set expiration date.
7. Click **Continue to summary**.
8. Click **Create Token**.
9. Copy and store token securely.

How to use token in terminal (non-interactive):
```bash
setx CLOUDFLARE_API_TOKEN "<your-token>"
```
Then restart terminal and run:
```bash
npx wrangler whoami
```

## D) If You Want External Free LLM Keys (Optional)

Not required for this project because Workers AI is built-in, but if you want external providers later:

1. OpenRouter free-tier key: https://openrouter.ai/
2. Groq free-tier key: https://console.groq.com/

Share only if you explicitly want dual-provider fallback beyond Cloudflare Workers AI.

## F) GitHub Repository Setup (your new repo)

Your repo is correct and exactly what was requested:
- `https://github.com/amareshwar3/cf_ai_cloudflare`

Now push current project to that repo:

```bash
git init
git add .
git commit -m "Initial Cloudflare AI assignment implementation"
git branch -M main
git remote add origin https://github.com/amareshwar3/cf_ai_cloudflare.git
git push -u origin main
```

Then create a feature branch for improvements/PR:

```bash
git checkout -b feature/assignment-polish
```

After additional changes:

```bash
git add .
git commit -m "Enhance LLM verification and setup documentation"
git push -u origin feature/assignment-polish
```

Open PR in GitHub:
- Base: `main`
- Compare: `feature/assignment-polish`

## G) Your current dashboard status (what it means)

You shared these values:
- Worker domain: `cfai.amareshwaranampally.workers.dev`
- Builds repo connected: `amareshwar3/cf_ai_cloudflare`
- Deploy command: `npx wrangler deploy`
- Build token already selected: `cfai build token`

This is correct and deployment-ready.

## H) Cloudflare Access enabled warning (important for submission)

You currently have Access enabled on your workers.dev domain. That means reviewers outside your Cloudflare account may not be able to open your app.

You have two options:

Option 1 (recommended for assignment review):
- Temporarily disable Access on the worker domain while the reviewer checks your app.
- Re-enable later if needed.

Option 2 (keep Access enabled):
- Keep Access policy but add JWT validation in the Worker app (`Cf-Access-Jwt-Assertion`) using your AUD and JWK URL.
- This is more secure but adds auth friction for reviewers.

If your goal is fastest review approval, Option 1 is usually easier.
