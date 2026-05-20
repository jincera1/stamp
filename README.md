This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment variables

Copy `.env.local` and set:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (browser client) |
| `ANTHROPIC_API_KEY` | Anthropic API key for `/api/chat-log` |

Run these in the Supabase SQL editor if tables or policies are missing:

- `supabase/profiles.sql` — user profiles (signup inserts a row)
- `supabase/experiences.sql` — stamps table and RLS (includes a discover read policy for authenticated users)

## App tabs (authenticated)

| Route | Purpose |
| --- | --- |
| `/discover` | Browse other users' stamps (searchable list) |
| `/archive` | Your saved stamps (`user_id` = you) |
| `/friends` | List other STAMP profiles |
| `/profile` | View email, edit display name, sign out |
| `/log` | Conversational logging (Anthropic chat) |

## Conversational logging (`/log`)

- Chat UI posts conversation history to `POST /api/chat-log` (Claude via `@anthropic-ai/sdk`).
- Assistant emits `PREVIEW|{"title","description","place","tags","occurred_at"}` for structured preview cards.
- On `LOG_SAVED`, the client inserts into `experiences` for the signed-in user.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
