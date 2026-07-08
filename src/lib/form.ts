import * as z from "zod";

/** Shared shape returned by form Server Actions (used with `useActionState`). */
export type FormState =
  | {
      error?: string;
      fieldErrors?: Record<string, string[] | undefined>;
      success?: string;
    }
  | undefined;

/** Flatten a ZodError into per-field messages (Zod v4 API). */
export function toFieldErrors(error: z.ZodError): Record<string, string[] | undefined> {
  return z.flattenError(error).fieldErrors;
}
