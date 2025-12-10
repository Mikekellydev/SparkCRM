# SparkCRM

SparkCRM is a lean CRM aimed at small and medium businesses that need Workday/ADP-like clarity without the enterprise price tag. It ships as a React + Vite SPA with Supabase authentication and a focused UI for contacts, tasks, and an operating dashboard.

## Features
- Authenticated access via Supabase with login, reset, and protected routes.
- Dashboard with pipeline snapshot, quick actions, work queue, and performance guardrails.
- Contact management with search, inline editing, and stats for recent growth.
- Task management with due dates, overdue visibility, and completion tracking.
- Responsive shell with consistent navigation, dark theme, and toast notifications.

## Getting started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env` (or `.env.local`) with your Supabase keys:
   ```bash
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Run the app:
   ```bash
   npm run dev
   ```

## Build
```bash
npm run build
```
Build output lands in `dist/`.

## Deploying to GitHub Pages
- The Vite base is set to `/SparkCRM/` in `vite.config.ts`. If your repo name changes, update that base path.
- Typical flow: `npm run build`, push the `dist` folder to a `gh-pages` branch (or use a GitHub Action), and enable Pages to serve from that branch/folder.
- Because this is an SPA, ensure Pages is configured to fall back to `index.html` (HashRouter is another option if you prefer).

## Next steps
- Wire Supabase tables to additional fields (company, phone, owner, stage).
- Add billing/pricing surface for customers.
- Layer in audit logs and role-based access.
