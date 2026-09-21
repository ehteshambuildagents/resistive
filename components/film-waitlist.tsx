"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowRight, Check, LoaderCircle } from "lucide-react";
import { waitlistSchema, spendOptions } from "@/lib/waitlist";

type Values = { firstName: string; email: string; company: string; monthlySpend: string; website: string };
const initialValues: Values = { firstName: "", email: "", company: "", monthlySpend: "", website: "" };

export default function FilmWaitlist() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [alreadyJoined, setAlreadyJoined] = useState(false);
  const [message, setMessage] = useState("");
  const successHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => { if (status === "success") successHeading.current?.focus(); }, [status]);

  function update(key: keyof Values, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
    if (status === "error") setStatus("idle");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;
    const parsed = waitlistSchema.safeParse({ ...values, consent: true });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] || "form");
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setStatus("submitting");
    setMessage("");
    try {
      const response = await fetch("/api/waitlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data), signal: AbortSignal.timeout(15000) });
      const data = await response.json() as { success?: boolean; alreadyJoined?: boolean; message?: string };
      if (!response.ok || !data.success) throw new Error(data.message || "Something went wrong. Please try again.");
      setAlreadyJoined(Boolean(data.alreadyJoined));
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return <div className="film-form-success" role="status"><span className="film-success-mark"><Check /></span><h3 ref={successHeading} tabIndex={-1}>{alreadyJoined ? "You’re already on the list." : "You’re on the list."}</h3><p>{alreadyJoined ? "We’ll keep you posted." : "We’ll be in touch when early access opens."}</p></div>;
  }

  return (
    <form className="film-waitlist" onSubmit={submit} noValidate aria-label="Join Resistive early access" aria-busy={status === "submitting"}>
      <div className="film-form-row"><label htmlFor="film-first-name">First name</label><input id="film-first-name" name="firstName" autoComplete="given-name" placeholder="First name" value={values.firstName} onChange={(event) => update("firstName", event.target.value)} aria-invalid={Boolean(errors.firstName)} />{errors.firstName && <span className="film-field-error">{errors.firstName}</span>}</div>
      <div className="film-form-row"><label htmlFor="film-email">Work email</label><input id="film-email" name="email" type="email" autoComplete="email" placeholder="you@company.com" value={values.email} onChange={(event) => update("email", event.target.value)} aria-invalid={Boolean(errors.email)} />{errors.email && <span className="film-field-error">{errors.email}</span>}</div>
      <div className="film-form-row"><label htmlFor="film-company">Company</label><input id="film-company" name="company" autoComplete="organization" placeholder="Company" value={values.company} onChange={(event) => update("company", event.target.value)} aria-invalid={Boolean(errors.company)} />{errors.company && <span className="film-field-error">{errors.company}</span>}</div>
      <div className="film-form-row film-form-optional"><label htmlFor="film-spend">Monthly paid social spend <span>(optional)</span></label><select id="film-spend" name="monthlySpend" value={values.monthlySpend} onChange={(event) => update("monthlySpend", event.target.value)}><option value="">Select a range</option>{spendOptions.map((option) => <option value={option} key={option}>{option}</option>)}</select></div>
      <div className="film-honeypot" aria-hidden="true"><label htmlFor="film-website">Website</label><input id="film-website" tabIndex={-1} autoComplete="off" value={values.website} onChange={(event) => update("website", event.target.value)} /></div>
      {status === "error" && <p className="film-form-error" role="alert">{message}</p>}
      <button type="submit" className="film-submit" disabled={status === "submitting"}>{status === "submitting" ? <>Joining <LoaderCircle className="film-spin" size={14} /></> : <>Join Early Access <ArrowRight size={15} /></>}</button>
      <p className="film-consent">Occasional Resistive product updates. Unsubscribe anytime.</p>
    </form>
  );
}
