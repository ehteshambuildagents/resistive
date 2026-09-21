/**
 * Transactional email and admin notification for a new waitlist signup.
 *
 * Every function here is best-effort: the database row is the source of truth,
 * so a provider outage must never cost us the signup. Each one resolves with a
 * short reason string instead of throwing, and the caller logs it.
 */

const TIMEOUT = 8000;
const HIGH_VALUE = new Set(["$100K–$500K", "$500K+"]);

export type Lead = {
  firstName: string;
  email: string;
  company: string;
  monthlySpend: string | null;
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, ch =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);

async function post(url: string, init: RequestInit) {
  const response = await fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT) });
  if (!response.ok) throw new Error(`${response.status}`);
  return response;
}

function sendEmail(to: string, subject: string, text: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!key || !from) return Promise.reject(new Error("not configured"));
  return post("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, text, html }),
  });
}

/** Welcome email. Sent once, only for a genuinely new row. */
export async function sendWelcome(lead: Lead) {
  const text = `Hi ${lead.firstName},

You're on the Resistive early-access list.

We're building a Creative R&D Engine that learns from a brand's advertising history, helps determine what deserves to be tested next, and turns those bets into finished creative.

We'll keep you posted as early access opens.

— Resistive
getresistive.com`;
  const html = `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1c20">
<p>Hi ${escapeHtml(lead.firstName)},</p>
<p>You’re on the Resistive early-access list.</p>
<p>We’re building a Creative R&amp;D Engine that learns from a brand’s advertising history, helps determine what deserves to be tested next, and turns those bets into finished creative.</p>
<p>We’ll keep you posted as early access opens.</p>
<p>— Resistive<br><a href="https://getresistive.com" style="color:#3d78ff">getresistive.com</a></p>
</div>`;
  await sendEmail(lead.email, "You’re on the Resistive waitlist", text, html);
}

/**
 * Admin ping, in order of preference: Telegram, then email. Exactly one
 * notification is sent — the email is only attempted when Telegram is absent
 * or actually failed. If both are unavailable this rejects with the reasons
 * for each, which the caller logs; it never affects the visitor's outcome.
 *
 * Spend band is surfaced so a larger advertiser is obvious at a glance. It is
 * an internal label only and does not change the stored status.
 */
export async function notifyAdmin(lead: Lead): Promise<"telegram" | "email"> {
  const spend = lead.monthlySpend || "Not provided";
  const flag = lead.monthlySpend && HIGH_VALUE.has(lead.monthlySpend) ? "HIGH-VALUE WAITLIST LEAD\n\n" : "";
  const lines = `${flag}New Resistive waitlist signup

Name: ${lead.firstName}
Email: ${lead.email}
Company: ${lead.company}
Paid social spend: ${spend}
Time: ${new Date().toISOString()}`;

  const why: string[] = [];

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (token && chat) {
    try {
      await post(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chat, text: lines, disable_web_page_preview: true }),
      });
      return "telegram";
    } catch (error) {
      why.push(`telegram: ${error instanceof Error ? error.message : "failed"}`);
    }
  } else {
    why.push("telegram: not configured");
  }

  const admin = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (admin) {
    try {
      await sendEmail(
        admin,
        `${flag ? "High-value " : ""}Resistive waitlist: ${lead.company}`,
        lines,
        `<pre style="font:14px/1.6 ui-monospace,Menlo,Consolas,monospace">${escapeHtml(lines)}</pre>`,
      );
      return "email";
    } catch (error) {
      why.push(`admin email: ${error instanceof Error ? error.message : "failed"}`);
    }
  } else {
    why.push("admin email: not configured");
  }

  throw new Error(why.join("; "));
}
