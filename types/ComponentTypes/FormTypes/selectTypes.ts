import { AvailableIcons } from "../../../utils";
import { BaseFormComponentType, onChangeValue } from "../../baseTypes";
import { AvatarShape } from "../MiscTypes";

export interface SelectOptionType {
  label: string;
  value: string;
  parent_id?: string | null;
  project_id?: string | null;
  color?: string | null;
  image?: { id: string | undefined; link: string; shape?: AvatarShape };
  icon?: AvailableIcons;
  isDisabled?: boolean;
}
export interface SelectType extends BaseFormComponentType {
  name: string;
  placeholder?: string;
  label?: string;
  helperText?: string;
  isMultiple?: boolean;
  isTruncated?: boolean;
  isClearable?: boolean;
  hasSearch?: boolean;
  isExpandingToNewRow?: boolean;
  value: string | string[] | number | null | undefined;
  options: SelectOptionType[];
  onChange: ({ name, value, label, image, icon, parent_id }: onChangeValue) => void;
  isReadOnly?: boolean;
}
