import { BaseFormComponentType, onChangeValue } from "../../baseTypes";
import { AvatarShape } from "../MiscTypes";

export type SelectOptionType = {
  label: string;
  value: string;
  image?: { link: string; shape?: AvatarShape };
  icon?: string;
};
export interface SelectType extends BaseFormComponentType {
  name: string;
  placeholder?: string;
  label?: string;
  helperText?: string;
  isMultiple?: boolean;
  value: string | string[] | null | undefined;
  options: SelectOptionType[];
  onChange: ({ name, value }: onChangeValue) => void;
}
