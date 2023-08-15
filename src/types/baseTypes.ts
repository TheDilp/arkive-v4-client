export type Size = "xxs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type Variant =
  | "primary"
  | "secondary"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "primary-bordered"
  | "secondary-bordered"
  | "info-bordered"
  | "success-bordered"
  | "warning-bordered"
  | "error-bordered";
export type AssetType = "images" | "maps";
export type PositionType = (
  | "top"
  | "right"
  | "bottom"
  | "left"
  | "right-start"
  | "right-end"
  | "left-start"
  | "left-end"
  | "bottom-start"
  | "top-start"
  | "top-end"
  | "bottom-end"
)[];

export type ImagePreviewType = { id?: string; title: string; url?: string; clearAction: (id: string) => void };
export type onChangeValue = {
  name: string;
  value: string | string[] | undefined;
};
export interface BaseComponentType {
  size?: Size;
  variant?: Variant;
}
export type HandleChangePropsType = { name: string; value: any | any[] } | { name: string; value: any | any[] }[];
export interface BaseFormComponentType extends BaseComponentType {
  isDisabled?: boolean;
  isLoading?: boolean;
}

export type DiceRollType = {
  value: number;
  valid: boolean;
  dice?: {
    value: number;
    critical: "success" | "failure" | null;
    rolls: {
      value: number;
      critical: "success" | "failure";
      order: number;
      type: "die" | "number";
      drop?: boolean | undefined;
    }[];
  }[];
  rolls?: {
    value: number;
    critical: "success" | "failure" | null;
    order: number;
    drop?: boolean | undefined;
    type: "die" | "number";
  }[];
  ops: ("+" | "-" | "/" | "*")[];
};
