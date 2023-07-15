import { AssetType } from "../../baseTypes";
import { SelectType } from "../FormTypes";

export interface ImageSelectType extends Pick<SelectType, "value" | "onChange" | "name"> {
  label?: string;
  type: AssetType;
}
