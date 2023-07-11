import { Size } from "../../baseTypes";
import { ButtonType } from "./buttonTypes";

export interface ButtonGroupType {
  buttons: ButtonType[];
  value?: string;
  size?: Size;
}
