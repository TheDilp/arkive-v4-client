export interface ColorPickerType {
  name: string;
  value: string;
  hasCustom?: boolean;
  onChange: ({ name, value }: { name: string; value: string }) => void;
}

export interface ColorPaletteType {
  name: string;
  hasCustom?: boolean;
  closeTooltip?: () => void;
  onChange: ({ name, value }: { name: string; value: string }) => void;
}
