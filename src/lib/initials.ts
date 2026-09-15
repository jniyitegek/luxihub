/** Two-letter monogram for an avatar fallback, e.g. "Clarisse Mutoni" -> "CM". */
export function initialsFor(name?: string | null): string {
  const parts = (name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .filter((p) => !/^\(/.test(p));

  if (parts.length === 0) return '··';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
