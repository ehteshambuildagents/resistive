import { waitlistSchema } from "@/lib/waitlist";
import { sendWelcome, notifyAdmin, type Lead } from "@/lib/waitlist-notify";

const headers = { "Cache-Control": "no-store" };
const CONSENT_TEXT =
  "Join the waitlist and receive occasional Resistive product updates. Unsubscribe anytime.";

const fail = (status: number, message: string, field?: string) =>
  Response.json({ success: false, message, ...(field ? { field } : {}) }, { status, headers });

/**
 * Basic abuse protection, NOT a global quota.
 *
 * The window lives in the memory of one Cloudflare isolate, and a request may
 * be served by any isolate, so a determined caller can exceed this. It exists
 * to trim obvious floods and accidental double-submits. Treat the database
 * unique index, not this, as the guarantee.
 * ponytail: in-memory limiter; move to KV or Durable Objects if real abuse starts.
 */
const hits = new Map<string, number[]>();
function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter(t => now - t < 60_000);
  recent.push(now);
  if (hits.size > 5_000) hits.clear();
  hits.set(ip, recent);
  return recent.length > 5;
}

/**
 * Vercel's proxy sets x-vercel-forwarded-for and overwrites x-forwarded-for on
 * every inbound request, so a client cannot forge either one. Both are read in
 * that order of preference. Outside production neither exists, and the
 * forwarded header is then only a local dev server naming its caller.
 */
function clientIp(request: Request) {
  const h = request.headers;
  const trusted = h.get("x-vercel-forwarded-for") || h.get("x-real-ip");
  if (trusted) return trusted.split(",")[0].trim();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (process.env.VERCEL && forwarded) return forwarded;
  if (process.env.NODE_ENV !== "production") return forwarded || "local";
  return "unattributed";
}

/**
 * PostgREST reports a constraint violation as JSON carrying the SQLSTATE and
 * the constraint that failed, e.g.
 *   {"code":"23505","message":"duplicate key value violates unique constraint
 *    \"waitlist_email_normalized_key\"","details":"Key (email_normalized)=(a@b.com)..."}
 * Only a unique violation on the email index means "already on the list". Any
 * other conflict is a real fault and must surface as a provider failure.
 * The exact body should be confirmed against the live project during the
 * production smoke test; this parse is deliberately defensive either way.
 */
function isEmailAlreadyRegistered(raw: string) {
  let body: { code?: string; message?: string; details?: string; constraint?: string };
  try {
    body = JSON.parse(raw) as typeof body;
  } catch {
    return false;
  }
  if (body?.code !== "23505") return false;
  const where = `${body.constraint ?? ""} ${body.message ?? ""} ${body.details ?? ""}`.toLowerCase();
  return where.includes("email");
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return fail(403, "Please submit this form from the Resistive website.");
  if (!request.headers.get("content-type")?.includes("application/json"))
    return fail(415, "Unsupported request format.");
  if (Number(request.headers.get("content-length") || 0) > 10_000)
    return fail(413, "Request is too large.");

  if (rateLimited(clientIp(request)))
    return fail(429, "Too many attempts. Please try again in a minute.");

  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > 10_000) return fail(413, "Request is too large.");
    body = JSON.parse(text);
  } catch {
    return fail(400, "Please check your details and try again.");
  }

  const parsed = waitlistSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return fail(400, issue?.message || "Please check your details.", String(issue?.path?.[0] ?? ""));
  }
  // Honeypot: a real person never fills this. Answer as if it succeeded.
  if (parsed.data.website) return Response.json({ success: true, alreadyJoined: true }, { status: 200, headers });

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key)
    return fail(503, "Early access registration is opening soon. Please check back shortly.");

  const lead: Lead = {
    firstName: parsed.data.firstName,
    email: parsed.data.email,
    company: parsed.data.company,
    monthlySpend: parsed.data.monthlySpend || null,
  };

  let created = false;
  try {
    // No on_conflict clause: let the unique index decide. A 23505 on the email
    // index is the only reliable way to know not to send a second welcome
    // email; every other conflict is a genuine fault.
    const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1/waitlist`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        first_name: lead.firstName,
        email: lead.email,
        company: lead.company,
        monthly_ad_spend: lead.monthlySpend,
        marketing_consent: parsed.data.consent === true,
        consent_text: CONSENT_TEXT,
        status: "waitlist",
        source: "website",
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      const detail = await response.text();
      if (response.status === 409 && isEmailAlreadyRegistered(detail))
        return Response.json({ success: true, alreadyJoined: true }, { status: 200, headers });
      console.error("waitlist insert failed", response.status, detail.slice(0, 300));
      return fail(502, "We couldn’t save your request. Please try again in a moment.");
    }
    created = true;
  } catch {
    return fail(502, "We couldn’t connect. Please try again in a moment.");
  }

  // The row exists. Nothing below may change the visitor's outcome.
  if (created) {
    const results = await Promise.allSettled([sendWelcome(lead), notifyAdmin(lead)]);
    const names = ["welcome email", "admin notification"];
    results.forEach((r, i) => {
      if (r.status === "rejected") console.error(`waitlist ${names[i]} failed:`, String(r.reason).slice(0, 200));
    });
  }

  return Response.json({ success: true, alreadyJoined: false }, { status: 201, headers });
}
