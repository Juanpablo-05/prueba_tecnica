import { describe, expect, it } from "vitest";
import { buildSearchString, parsePositiveInt } from "./query-string";

describe("query-string helpers", () => {
  it("returns the fallback for empty or invalid values", () => {
    expect(parsePositiveInt(null, 5)).toBe(5);
    expect(parsePositiveInt("0", 5)).toBe(5);
    expect(parsePositiveInt("-3", 5)).toBe(5);
    expect(parsePositiveInt("abc", 5)).toBe(5);
    expect(parsePositiveInt("7", 5)).toBe(7);
  });

  it("serializes only defined filters", () => {
    const result = buildSearchString("/doctor/prescriptions", {
      status: "PENDING",
      page: 2,
      from: "",
      to: null,
      doctorId: undefined,
    });

    expect(result).toBe("/doctor/prescriptions?status=PENDING&page=2");
  });
});
