export type IconPosition = "left" | "right";
export type IconThickness = "thin" | "light" | "regular" | "bold" | "fill";
export interface IconType {
  icon: string;
  fontSize?: number;
  color?: string;
  className?: string;
  thickness?: IconThickness;
}
