import { AssetType } from "../../baseTypes";
import { ButtonType, SearchType } from "..";

export interface ImageSelectType
  extends Pick<SearchType, "value" | "onChange" | "name" | "helperText">,
    Pick<ButtonType, "isIconOnly"> {
  label?: string;
  type: AssetType;
}
