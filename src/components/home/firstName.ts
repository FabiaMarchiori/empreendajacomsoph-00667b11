/** Display only a valid first name from the existing profile, never an email. */
export function getFirstName(value: unknown): string | null {
  if (typeof value !== "string" || value.includes("@")) return null;
  const first = value.normalize("NFC").trim().split(/\s+/u)[0];
  if (
    first.length > 40 ||
    !/^[\p{L}\p{M}]+(?:['’-][\p{L}\p{M}]+)*$/u.test(first)
  )
    return null;
  return first;
}
