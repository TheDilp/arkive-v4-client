import { AssetType, BaseFormComponentType, SearchableEntities, SelectOptionType } from "../..";

export interface SearchType extends BaseFormComponentType {
  value?: string | string[] | undefined | null;
  initialOptions?: SelectOptionType[];
  searchEntity: SearchableEntities;
  name: string;
  label?: string;
  helperText?: string;
  placeholder?: string;
  buttonIcon?: string;
  isAutocomplete?: boolean;
  hasShownOption?: boolean;
  initialDisplayValue?: string;
  imageType?: AssetType;
  onChange: ({
    name,
    value,
    label,
    image,
  }: {
    name: string;
    value: string;
    label?: string;
    color?: string;
    image?: string;
  }) => void;
}
