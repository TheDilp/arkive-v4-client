import { FocusEventHandler, HTMLInputTypeAttribute, KeyboardEvent } from "react";

import { BaseFormComponentType } from "../../baseTypes";

export interface InputOnChangeValue {
  name: string;
  value: string | number | undefined | null;
}
export interface InputType extends BaseFormComponentType {
  name: string;
  type?: HTMLInputTypeAttribute;
  placeholder?: string;
  label?: string;
  isInline?: boolean;
  onChange: ({ name, value }: InputOnChangeValue) => void;
  onKeyDown?: (e: KeyboardEvent) => void;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  value: string | number | undefined;
  isReadOnly?: boolean;
  isAutofocused?: boolean;
  helperText?: string;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  prefix?: string;
}
