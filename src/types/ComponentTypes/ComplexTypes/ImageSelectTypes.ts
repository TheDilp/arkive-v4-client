import { AssetType } from "../../baseTypes";
import { SearchType } from "../FormTypes/searchTypes";

export interface ImageSelectType extends Pick<SearchType, "value" | "onChange" | "name"> {
  label?: string;
  type: AssetType;
}
