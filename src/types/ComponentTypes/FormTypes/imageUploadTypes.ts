import { Dispatch, SetStateAction } from "react";

export type ImageUploadOnChange = Dispatch<SetStateAction<File[]>>;
export interface ImageUploadType {
  images: File[];
  isDisabled?: boolean;
  isMultiple?: boolean;
  onChange: ImageUploadOnChange;
}
