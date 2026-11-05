import { describe, expect, it } from "vitest";
import { normalizeTags } from "./tags";

describe("normalizeTags", () => {
  it("trims names, creates slugs, and removes duplicate or blank tags", () => {
    expect(
      normalizeTags(["  TypeScript ", "typescript", "  ", "Web & Design"])
    ).toEqual([
      { name: "TypeScript", slug: "typescript" },
      { name: "Web & Design", slug: "web-and-design" },
    ]);
  });

  it("keeps the first name when tags normalize to the same slug", () => {
    expect(normalizeTags(["Café", "Cafe"])).toEqual([
      { name: "Café", slug: "cafe" },
    ]);
  });
});
