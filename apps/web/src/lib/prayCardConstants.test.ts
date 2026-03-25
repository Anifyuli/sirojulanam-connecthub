import { describe, it, expect } from "vitest";
import { COLORS, type ColorKey } from "../lib/prayCardConstants";

describe("COLORS", () => {
  it("should have correct teal color", () => {
    expect(COLORS.teal).toEqual({ bg: "#4ecdc4", text: "#ffffff" });
  });

  it("should have correct yellow color", () => {
    expect(COLORS.yellow).toEqual({ bg: "#ffd63f", text: "#1a1a2e" });
  });

  it("should have all expected color keys", () => {
    const expectedKeys: ColorKey[] = ["teal", "yellow", "blue", "cyan", "orange", "lime"];
    expect(Object.keys(COLORS)).toEqual(expectedKeys);
  });

  it("should have bg and text for each color", () => {
    for (const color of Object.values(COLORS)) {
      expect(color).toHaveProperty("bg");
      expect(color).toHaveProperty("text");
      expect(color.bg).toMatch(/^#[0-9a-f]{6}$/);
      expect(color.text).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});
