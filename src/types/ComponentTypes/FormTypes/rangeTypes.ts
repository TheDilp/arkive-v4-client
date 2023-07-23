import { BaseComponentType } from "../..";

export interface RangeType extends BaseComponentType {
  label?: string;
  min: number;
  max: number;
  step?: number;
  value: string;
  name: string;
  onChange: ({ name, value }: { name: string; value: string }) => void;
}
