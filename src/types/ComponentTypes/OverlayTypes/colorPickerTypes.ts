export interface ColorPickerType {
  name: string;
  value: string;
  onChange: ({ name, value }: { name: string; value: string }) => void;
}

export interface ColorPaletteType {
  name: string;
  onChange: ({ name, value }: { name: string; value: string }) => void;
}
