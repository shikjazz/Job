# Job Application Command Center

A deployable React + Vite + Supabase job application tracker.

## Features
- Magic-link login with Supabase Auth
- Cloud database for jobs
- Local fallback if Supabase is not configured
- Add/edit/delete jobs
- Status tracking
- Referral tracker
- Interview tracker
- Follow-up reminders after 7 days
- Candidate profile
- Resume upload with Supabase Storage
- Cover letter, follow-up, LinkedIn, and tailored resume templates
- Optional OpenAI template generation via Vercel serverless function
- Optional Resend reminder endpoint via Vercel Cron
- Analytics dashboard
- Export/import backup
- Mobile responsive UI
- Chrome extension starter for copying job page info

## Run locally in VS Code

1. Install Node.js LTS from https://nodejs.org
2. Open VS Code.
3. Open this folder: `job-apply-command-center`.
4. Open VS Code terminal.
5. Run:

```bash
npm install
npm run dev
```

6. Open the localhost URL printed in terminal.

## Supabase setup

1. Create a project at https://supabase.com
2. Go to SQL Editor.
3. Paste and run `supabase/schema.sql`.
4. Go to Project Settings -> API.
5. Copy Project URL and anon public key.
6. Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

7. Fill:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

8. Restart dev server.

## Deploy to Vercel

1. Push this folder to GitHub.
2. Go to https://vercel.com and import the GitHub repository.
3. Framework preset: Vite.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Add environment variables in Vercel Project Settings:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
OPENAI_API_KEY=optional
RESEND_API_KEY=optional
REMINDER_TO_EMAIL=optional
```

7. Deploy.
8. Send your friend the Vercel URL.

## Optional AI

Add `OPENAI_API_KEY` locally or in Vercel. The AI button then generates and copies tailored content.

## Optional email reminders

Add `RESEND_API_KEY` and `REMINDER_TO_EMAIL`. The included `vercel.json` schedules `/api/send-reminders` daily at 09:00 UTC.
