import { ImageUploadOnChange } from "../../types";

export function changeImagesForUpload(onChange: ImageUploadOnChange, existingImages: string[], newImages: File[]) {
  const filesToAdd: File[] = [];
  for (let index = 0; index < newImages.length; index += 1) {
    if (!existingImages.includes(newImages[index].name)) filesToAdd.push(newImages[index]);
  }

  onChange((prev) => {
    if (prev) return prev.concat(filesToAdd);
    return filesToAdd;
  });
}
