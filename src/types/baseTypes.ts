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

export type ImagePreviewType = { name: string; url: string };
export type onChangeValue = {
  name: string;
  value: string | string[] | undefined;
};
export interface BaseComponentType {
  size?: Size;
  variant?: Variant;
}
export interface BaseFormComponentType extends BaseComponentType {
  isDisabled?: boolean;
  isLoading?: boolean;
}
