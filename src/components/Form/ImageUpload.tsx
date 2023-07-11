import { ImageUploadType } from "../../types";
import { changeImagesForUpload } from "../../utils";

export function ImageUpload({ images, onChange }: ImageUploadType) {
  return (
    <div
      className="flex h-full w-full select-none items-center justify-center"
      id="dropzone-container"
      onDragOver={(e) => e.preventDefault()}
      onDragStart={(e) => e.dataTransfer.setData("text/plain", e.currentTarget.id)}
      onDrop={(e) => {
        e.preventDefault();
        const { files } = e.dataTransfer;
        if (files.length) {
          const existingFileNames = images.map((f) => f.name);
          changeImagesForUpload(onChange, existingFileNames, Array.from(files));
        }
      }}>
      <label
        className="flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-400 bg-zinc-600 hover:bg-zinc-500"
        htmlFor="dropzone-file">
        <div className="flex flex-col items-center justify-center pb-6 pt-5">
          <svg aria-hidden="true" className="h-10 w-10 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </svg>
          <p className="mb-2 text-base text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Image files are converted to the WEBP format.</span>
        </div>
        <input
          accept="image/*"
          className="hidden"
          id="dropzone-file"
          multiple
          onChange={(e) => {
            if (e.target.files?.length) {
              const files = Array.from(e.target.files);
              const existingFileNames = images.map((f) => f.name);
              changeImagesForUpload(onChange, existingFileNames, files);
            }
          }}
          type="file"
        />
      </label>
    </div>
  );
}
