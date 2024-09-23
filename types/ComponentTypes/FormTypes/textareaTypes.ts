import { BaseComponentType, BaseFormComponentType } from "../../baseTypes";
import { InputOnChangeValue } from "./inputTypes";

export interface TextareaType extends BaseComponentType, BaseFormComponentType {
  name: string;
  placeholder?: string;
  label?: string;
  onChange: ({ name, value }: InputOnChangeValue) => void;
  onKeyDown?: (e: KeyboardEvent) => void;
  value: string | number | undefined;
  helperText?: string;
  isResizable?: boolean;
  isDisabled?: boolean;
  maxLength?: number;
  hasNoBackground?: boolean;
}
