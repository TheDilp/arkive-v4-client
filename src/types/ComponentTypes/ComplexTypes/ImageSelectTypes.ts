import { AssetType } from "../../baseTypes";
import { ButtonType, SearchType } from "..";

export interface ImageSelectType extends Pick<SearchType, "value" | "name" | "helperText">, Pick<ButtonType, "isIconOnly"> {
  label?: string;
  type: AssetType;
  isDisabled?: boolean;
  onChange: ({ name, value, label }: { name: string; value: string | null; label?: string }) => void;
}
