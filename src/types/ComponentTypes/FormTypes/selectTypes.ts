import { BaseFormComponentType, onChangeValue } from "../../baseTypes";
import { AvatarShape } from "../MiscTypes";

export interface SelectOptionType {
  label: string;
  value: string;
  image?: { link: string; shape?: AvatarShape };
  icon?: string;
  isDisabled?: boolean;
}
export interface SelectType extends BaseFormComponentType {
  name: string;
  placeholder?: string;
  label?: string;
  helperText?: string;
  isMultiple?: boolean;
  isClearable?: boolean;
  hasSearch?: boolean;
  isExpandingToNewRow?: boolean;
  value: string | string[] | number | null | undefined;
  options: SelectOptionType[];
  onChange: ({ name, value }: onChangeValue) => void;
  isReadOnly?: boolean;
}
