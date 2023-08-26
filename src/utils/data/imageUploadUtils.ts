import { ImageUploadOnChange } from "../../types";

export function mergeFileLists(fileListA: FileList, fileListB: FileList): FileList {
  const dataTransfer = new DataTransfer();

  for (let i = 0; i < fileListA.length; i += 1) {
    dataTransfer.items.add(fileListA[i]);
  }

  for (let i = 0; i < fileListB.length; i += 1) {
    dataTransfer.items.add(fileListB[i]);
  }

  return dataTransfer.files;
}

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
