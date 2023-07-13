import { IconOptions } from "../../../utils";
import { BaseFormComponentType, SearchableEntities } from "../..";

export interface SearchType extends BaseFormComponentType {
  label?: string;
  placeholder?: string;
  buttonIcon?: IconOptions;
  searchEntity?: SearchableEntities;

  onChange: ({ label, value }: { label: string; value: string }) => void;
}
