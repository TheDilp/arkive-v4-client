import { HTMLInputTypeAttribute, KeyboardEvent } from "react";

import { BaseFormComponentType } from "../../baseTypes";

export interface InputOnChangeValue {
  name: string;
  value: string | number | undefined;
}
export interface InputType extends BaseFormComponentType {
  name: string;
  type?: HTMLInputTypeAttribute;
  placeholder?: string;
  label?: string;
  onChange: ({ name, value }: InputOnChangeValue) => void;
  onKeyDown?: (e: KeyboardEvent) => void;
  value: string | number | undefined;
  helperText?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
}
