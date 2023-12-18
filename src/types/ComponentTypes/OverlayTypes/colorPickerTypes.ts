export interface ColorPickerType {
  name: string;
  value: string;
  hasCustom?: boolean;
  onChange: ({ name, value }: { name: string; value: string }) => void;
  closeTooltip?: () => void;
  isDisabled?: boolean;
}

export interface ColorPaletteType {
  name: string;
  value: string;
  hasCustom?: boolean;
  closeTooltip?: () => void;
  onChange: ({ name, value }: { name: string; value: string }) => void;
  isDisabled?: boolean;
}
