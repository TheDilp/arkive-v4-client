import { IconOptions } from "../../../utils";
import { BaseFormComponentType, SearchableEntities } from "../..";

export interface SearchType extends BaseFormComponentType {
  value?: string | string[] | undefined | null;
  searchEntity: SearchableEntities;
  name: string;
  label?: string;
  placeholder?: string;
  buttonIcon?: IconOptions;
  isAutocomplete?: boolean;
  onChange: ({ name, value, label }: { name: string; value: string; label?: string; color?: string }) => void;
}
