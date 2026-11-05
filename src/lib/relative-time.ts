const relativeTimeFormatter = new Intl.RelativeTimeFormat("en", {
  numeric: "auto",
});

export function formatRelativeTime(date: Date | string, now = new Date()) {
  const timestamp =
    date instanceof Date ? date.getTime() : new Date(date).getTime();
  if (!Number.isFinite(timestamp)) {
    throw new Error("Cannot format an invalid date as relative time.");
  }

  const seconds = Math.round((timestamp - now.getTime()) / 1_000);
  const absoluteSeconds = Math.abs(seconds);

  if (absoluteSeconds < 60) {
    return "just now";
  }

  const units: { length: number; unit: Intl.RelativeTimeFormatUnit }[] = [
    { length: 60, unit: "minute" },
    { length: 60, unit: "hour" },
    { length: 24, unit: "day" },
    { length: 7, unit: "week" },
    { length: 4.345, unit: "month" },
    { length: 12, unit: "year" },
  ];

  let value = seconds;
  for (const { length, unit } of units) {
    value /= length;
    if (Math.abs(value) < length || unit === "year") {
      return relativeTimeFormatter.format(Math.round(value), unit);
    }
  }

  return relativeTimeFormatter.format(Math.round(value), "year");
}
