import { Variant } from "../../types";

export function getButtonGroupVariant(variant: Variant, label: string, value?: string): Variant {
  if (value) {
    if (value === label) return "success";
    return "secondary";
  }
  return variant;
}
