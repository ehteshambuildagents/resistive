import { z } from "zod";
export const spendOptions = [
  "Under $10K",
  "$10K–$50K",
  "$50K–$100K",
  "$100K–$500K",
  "$500K+",
] as const;
export const waitlistSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "Enter your first name.")
    .max(80, "Use fewer than 80 characters."),
  email: z
    .string()
    .trim()
    .email("Enter a valid work email.")
    .max(254)
    .transform((s) => s.toLowerCase()),
  company: z
    .string()
    .trim()
    .min(1, "Enter your company name.")
    .max(160, "Use fewer than 160 characters."),
  monthlySpend: z.union([z.enum(spendOptions), z.literal("")]).default(""),
  website: z.string().max(200).default(""),
  consent: z.literal(true),
});
export type WaitlistInput = z.infer<typeof waitlistSchema>;
