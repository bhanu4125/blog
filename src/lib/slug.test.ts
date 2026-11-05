import { describe, expect, it } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("normalizes case, accents, punctuation, and ampersands", () => {
    expect(slugify("  Crème & Coffee: A Story!  ")).toBe(
      "creme-and-coffee-a-story"
    );
  });

  it("returns a safe fallback when no ASCII slug characters remain", () => {
    expect(slugify("こんにちは")).toBe("post");
  });

  it("collapses repeated separators", () => {
    expect(slugify("one---two___three")).toBe("one-two-three");
  });
});
