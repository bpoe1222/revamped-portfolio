export function estimatedReadingMinutes(markdown: string) {
  const plainText = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]+`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[[^\]]+\]\([^)]*\)/g, " ")
    .replace(/[#>*_~\-]/g, " ");
  const words = plainText.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export function formatDate(date: Date | null, timeZone = "America/Chicago") {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone,
  }).format(date);
}

export function siteUrl(path = "") {
  const base = process.env.SITE_URL ?? "https://baileypoe.dev";
  return new URL(path, base).toString();
}
