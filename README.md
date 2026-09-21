# Resistive

A custom, responsive Creative R&D product film built with the Next.js App Router, React, TypeScript, Tailwind CSS, and a scroll-scrubbed scene timeline. It is a standard Next.js application and deploys to Vercel. The retired Cloudflare Workers / vinext runtime is kept for reference in `.cloudflare-legacy/`.

## Development

Use the package manager pinned in `package.json`. `pnpm dev` runs Next.js on http://localhost:3000, `pnpm build` produces the production build and `pnpm start` serves it locally.

## Brand and motion

- The supplied Resistive raster logo is preserved unchanged in `public/brand`. A CSS crop and dark-surface color treatment retain the original mark.
- Geist Sans and Geist Mono are self-hosted with their license.
- The homepage is one pinned seven-scene sequence: creative abundance, territory mapping, evidence-backed hypotheses, production, market reality, learning, and the compounding loop.
- The persistent decision line carries creative objects through each scene; thumbnails become territories, hypotheses, storyboard frames, market signals, and the final mark.
- Reduced-motion preferences collapse the film into a readable linear experience with the waitlist still available.
- Small screens use fewer creative objects and reduced spatial depth while preserving the same chaos → structure → decision → production → result → learning arc.
- All campaign metrics are explicitly illustrative, not product performance claims.

## Deployment

This project deploys to Vercel as a standard Next.js application. `next build`
produces the output; no adapter or custom runtime is involved. Five server-only
environment variables must exist in the Vercel project:

```
SUPABASE_URL
SUPABASE_SECRET_KEY
RESEND_API_KEY
RESEND_FROM_EMAIL
ADMIN_NOTIFICATION_EMAIL
```

None of them may be prefixed with `NEXT_PUBLIC_`; they are read server-side in
`app/api/waitlist/route.ts` only.

## Enable the waitlist

1. Apply `supabase/waitlist.sql` to the intended Supabase project.
2. Configure server-only `SUPABASE_URL` and `SUPABASE_SECRET_KEY` environment variables. Never expose the secret key through `NEXT_PUBLIC`.
3. In production set these as Environment Variables in the Vercel project. For local work, use `.env.local` based on `.env.example`.
4. Confirm a registration appears in `public.waitlist` before opening the site to visitors. Duplicate email addresses return the same success state without creating duplicates.

The form deliberately returns an unavailable state when Supabase is not configured; it never tells visitors they joined a waitlist unless the server confirms the write. It does not save contact details in browser storage. The request handler validates again on the server, rejects cross-origin browser submissions and oversized payloads, uses a honeypot, and times out failed upstream requests. Before a public acquisition campaign, enable rate limiting at the host edge and review the final consent and retention policy for your operation.

## Social links and domain

`getresistive.com` appears as the brand domain in copy and in the welcome email footer. Attaching it to a deployment is a separate DNS step and does not change any existing website.

## Structure

- `app/page.tsx`: page entry
- `components/film.tsx`: complete evidence-to-ad story and five persistent photographic frames
- `components/film-waitlist.tsx`: validation, loading, failure, and confirmed-success states
- `lib/film-motion.ts`: actual GSAP master timeline, ScrollTrigger ownership, Lenis integration, and lifecycle cleanup
- `app/motion.css`: opening composition, mobile staging, and reduced-motion fallback
- `docs/motion-architecture.md`: scoped timeline and ownership contract
- `app/api/waitlist/route.ts`: server-only Supabase submission boundary
- `lib/waitlist.ts`: shared validation and spend ranges
- `app/globals.css`: brand tokens, responsive layouts, and interaction styling

There is no tracking, advertising pixel, external image CDN, or live ad-account data connection in this frontend.
