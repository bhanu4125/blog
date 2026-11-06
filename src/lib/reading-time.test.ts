import { describe, expect, it } from "vitest";
import { calculateReadingTime, formatReadingTime } from "./reading-time";

describe("calculateReadingTime", () => {
  it("returns zero for blank content", () => {
    expect(calculateReadingTime(" \n\t ")).toBe(0);
  });

  it("returns at least one minute for non-empty short content", () => {
    expect(calculateReadingTime("One small story.")).toBe(1);
  });

  it("rounds up at the 200-word-per-minute boundary", () => {
    expect(calculateReadingTime(Array(200).fill("word").join(" "))).toBe(1);
    expect(calculateReadingTime(Array(201).fill("word").join(" "))).toBe(2);
  });
});

describe("formatReadingTime", () => {
  it("formats single minute reads with proper grammar", () => {
    expect(formatReadingTime(1)).toBe("1 min read");
    expect(formatReadingTime(0)).toBe("1 min read");
  });

  it("formats multi-minute reads accurately", () => {
    expect(formatReadingTime(4)).toBe("4 min read");
    expect(formatReadingTime(15)).toBe("15 min read");
  });
});
