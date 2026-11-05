import { describe, expect, it } from "vitest";
import { formatRelativeTime } from "./relative-time";

describe("formatRelativeTime", () => {
  const now = new Date("2026-01-01T12:00:00.000Z");

  it("formats recent past and future timestamps", () => {
    expect(formatRelativeTime(new Date(now.getTime() - 3 * 60_000), now)).toBe(
      "3 minutes ago"
    );
    expect(formatRelativeTime(new Date(now.getTime() + 2 * 60_000), now)).toBe(
      "in 2 minutes"
    );
  });

  it("uses a just-now label for differences under one minute", () => {
    expect(formatRelativeTime(new Date(now.getTime() - 20_000), now)).toBe(
      "just now"
    );
  });

  it("rejects invalid date strings", () => {
    expect(() => formatRelativeTime("not a date", now)).toThrow(
      "Cannot format an invalid date as relative time."
    );
  });
});
