# Midhun Krishnakumar — AI-Powered Portfolio

A next-generation, search-first portfolio for **Midhun Krishnakumar**, Product Designer at Adobe. Recruiters explore work through queries instead of linear browsing—the experience feels like interacting with a product.

## Features

- **Full-screen hero** with dynamic AI gradient mesh, neural-network-inspired animations, and central search bar
- **Query-based exploration** — type "Adobe", "AI", or "Leadership" to filter and highlight relevant content
- **Quick tags** — Adobe Connect, AI Initiatives, Enterprise UX, Design Systems, and more
- **Featured Work** — inline expanding case study cards (problem, actions, outcomes)
- **Experience Timeline** — Bizongo → YUJ → Adobe career progression
- **AI Work** — AI Blog Generator, Gen AI explorations, intelligent workflows
- **Impact Dashboard** — animated counters for 50% onboarding, 80% QC, 40% heuristics, etc.
- **Mentorship & Leadership** — NID, Think Ethical, Adobe mentoring
- **Career Evolution** — Industrial Design → UX → Enterprise → AI-focused
- **Thought Layer** — insights on AI in product development
- **Recruiter panel** — Download Resume, LinkedIn, Contact, Summarize Candidate

## Development

```bash
npm install
```

**With LLM chat** (requires OpenAI API key):
```bash
cp .env.example .env
# Add your OPENAI_API_KEY to .env

npm run dev:full   # Runs API server + Vite dev
```

**Without LLM** (fallback to rule-based responses):
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Type "why hire" and press Enter to start the AI conversation.

## Build

```bash
npm run build
```

Output in `dist/`. Deploy to Vercel, Netlify, or any static host.

## LLM Setup

The AI conversation uses **OpenAI GPT-4o-mini** (with gpt-3.5-turbo fallback) when configured:

- **Local**: Set `OPENAI_API_KEY` in `.env` and run `npm run dev:full` (not just `npm run dev`)
- **Vercel**: Add **`OPENAI_API_KEY`** in **Project → Settings → Environment Variables**. Under **Environments**, ensure **Production** (and Preview if needed) is checked — not only Development. Save, then **Redeploy** (new deployments pick up env changes; a redeploy avoids stale builds).
- **Verify production API**: `curl -s -X POST "https://YOUR_DOMAIN.vercel.app/api/chat" -H "Content-Type: application/json" -d '{"message":"hi"}'` — you should get **HTTP 200** and a JSON `reply`. If you see `"OPENAI_API_KEY not set"`, the key is still missing for that deployment/environment.
- **GitHub Pages** (or any host without `/api`): build with `VITE_CHAT_API_BASE=https://YOUR_DOMAIN.vercel.app` so the browser calls your Vercel serverless API.

**If chat shows pre-written responses instead of LLM:**
1. Run `npm run dev:full` — both API server (port 3001) and Vite must run
2. Check `.env` has a valid `OPENAI_API_KEY` (from https://platform.openai.com/api-keys)
3. Open DevTools Console — errors like "Chat API error" indicate the API isn't reachable

Without an API key or if the API fails, the app falls back to pre-written responses (still functional).

## Tech Stack

- React 19 + TypeScript
- Vite 5
- Framer Motion
- OpenAI (gpt-4o-mini) for AI chat
- CSS Modules

## Content

All content is in `src/data/portfolioData.ts`. Update resume URL, LinkedIn, and case studies there.
