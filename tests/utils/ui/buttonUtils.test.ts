// export function getButtonGroupVariant(variant: Variant, label: string, value?: string): Variant {
//     if (value) {
//       if (value === label) return "success";
//       return "secondary";
//     }
//     return variant;
//   }
import { expect, test } from "vitest";

import { getButtonGroupVariant } from "../../../src/utils/ui/buttonUtils";

test("returns variant for button in button group when selected", () => {
  expect(getButtonGroupVariant("primary", "test", "test")).toBe("success");
});
test("returns variant for button in button group when not selected", () => {
  expect(getButtonGroupVariant("primary", "test", "test2")).toBe("secondary");
});
test("returns variant for button in button group when no value", () => {
  expect(getButtonGroupVariant("error", "test")).toBe("error");
});
