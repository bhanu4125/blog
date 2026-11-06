import { describe, expect, it } from "vitest";
import { isNavActive } from "./nav";

describe("isNavActive", () => {
  it("matches root path accurately without falsely matching subroutes", () => {
    expect(isNavActive("/", "/")).toBe(true);
    expect(isNavActive("/posts/hello", "/")).toBe(false);
    expect(isNavActive("/tags", "/")).toBe(false);
  });

  it("matches exact sub-routes and nested dynamic paths", () => {
    expect(isNavActive("/tags", "/tags")).toBe(true);
    expect(isNavActive("/tags/technology", "/tags")).toBe(true);
    expect(isNavActive("/tag", "/tags")).toBe(false);
    expect(isNavActive("/dashboard", "/tags")).toBe(false);
  });

  it("matches write routes and edit drafts", () => {
    expect(isNavActive("/write", "/write")).toBe(true);
    expect(isNavActive("/write/my-post-slug", "/write")).toBe(true);
    expect(isNavActive("/bookmarks", "/write")).toBe(false);
  });

  it("handles paths with search query parameters and hashes", () => {
    expect(isNavActive("/search?q=nextjs", "/search")).toBe(true);
    expect(isNavActive("/tags?page=2#top", "/tags")).toBe(true);
    expect(isNavActive("/tags/news?sort=recent", "/tags")).toBe(true);
    expect(isNavActive("/?ref=welcome", "/")).toBe(true);
  });
});
