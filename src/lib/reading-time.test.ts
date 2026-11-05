import { describe, expect, it } from "vitest";
import { calculateReadingTime } from "./reading-time";

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
