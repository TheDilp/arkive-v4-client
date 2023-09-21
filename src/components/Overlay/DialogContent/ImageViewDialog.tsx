/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */

export function ImageViewDialog({ data }: { data: { image?: string } }) {
  return (
    <div className="flex h-full w-full select-none items-center justify-center">
      <img
        alt="preview"
        className="cursor-default object-contain"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        src={data?.image}
      />
    </div>
  );
}
