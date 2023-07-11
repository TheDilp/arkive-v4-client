import { AssetType } from "../../baseTypes";
import { SelectType } from "../FormTypes";

export interface ImageSelectType extends Pick<SelectType, "value" | "onChange" | "options" | "name" | "isLoading"> {
  label?: string;
  type: AssetType;
}
