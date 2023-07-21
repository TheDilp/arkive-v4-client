import { BaseFormComponentType, SearchableEntities, SelectOptionType } from "../..";

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
  onChange: ({ name, value, label }: { name: string; value: string; label?: string; color?: string }) => void;
}
