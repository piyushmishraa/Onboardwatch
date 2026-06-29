# OnboardWatch

Crowd-sourced dashboard for tracking IT fresher onboarding delays, by company.
People submit a status report (company, batch, delayed/onboarded/offer revoked),
and the dashboard aggregates trends per company.

## Stack
- Next.js 14 (App Router) — frontend + API routes in one app
- Drizzle ORM + Neon Postgres (serverless, free tier works fine)
- No auth needed for v1 — IP-hash based throttling instead

## Local setup (10 minutes)

1. Install deps:
   ```
   npm install
   ```

2. Create a free Postgres DB at https://neon.tech (no card required). Copy the
   connection string.

3. Copy `.env.example` to `.env.local` and paste your connection string into
   `DATABASE_URL`. Set `ADMIN_KEY` to a long random secret too.

4. Push the schema to your DB:
   ```
   npx drizzle-kit push
   ```

5. Run it:
   ```
   npm run dev
   ```
   Open http://localhost:3000

## Deploy (free, ~10 minutes)

1. Push this folder to a new GitHub repo.
2. Go to https://vercel.com, import the repo.
3. In Vercel project settings → Environment Variables, add `DATABASE_URL`
   (same value as your `.env.local`) and `ADMIN_KEY`.
4. Deploy. You'll get a live URL like `onboardwatch.vercel.app`.

## What's deliberately NOT built yet (don't over-engineer before you have users)
- No login/auth — adds friction for a tool that needs anonymous reporting
- No moderation/verification UI — for v1, eyeball the data manually in
  `npx drizzle-kit studio` and delete obvious spam by hand
- No company name normalization (e.g. "wipro" vs "Wipro" vs "WIPRO") — fine
  for the first 100 reports, fix once it's actually a problem
- No email/notification system

## Validating the idea (do this before writing more code)
1. Deploy it today.
2. Post the link in 2-3 places where delayed freshers already gather:
   r/developersIndia, fresher WhatsApp/Telegram groups, LinkedIn posts about
   the Wipro/TCS/Infosys onboarding delays.
3. Don't beg people individually to submit — see if it spreads on its own
   after the first post. If after a week nobody outside your immediate circle
   has submitted a report, the distribution problem is harder than the
   product problem, and that's the thing to solve next, not more features.
4. If it does get traction, the next real feature is verification (optional
   screenshot upload) so the data is trustworthy enough to pitch to
   journalists or ed-tech companies as a data source.
