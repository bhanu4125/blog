import { describe, expect, it } from "vitest";
import { createCommentSchema } from "./comment";

describe("createCommentSchema", () => {
  it("rejects empty or whitespace-only comments", () => {
    expect(createCommentSchema.safeParse({ content: "" }).success).toBe(false);
    expect(
      createCommentSchema.safeParse({ content: "   \n\t  " }).success
    ).toBe(false);
  });

  it("accepts valid comments within 2,000 characters", () => {
    const valid = createCommentSchema.safeParse({
      content: "This is a thoughtful comment on the story.",
    });
    expect(valid.success).toBe(true);
  });

  it("accepts threaded reply comments with parentId", () => {
    const reply = createCommentSchema.safeParse({
      content: "I completely agree with your point.",
      parentId: "64a1b2c3d4e5f6a7b8c9d0e1",
    });
    expect(reply.success).toBe(true);
  });

  it("rejects comments exceeding the 2,000 character limit", () => {
    const oversized = createCommentSchema.safeParse({
      content: "a".repeat(2_001),
    });
    expect(oversized.success).toBe(false);
    if (!oversized.success) {
      expect(oversized.error.issues[0]?.message).toMatch(
        /2,000 characters or fewer/
      );
    }
  });
});
