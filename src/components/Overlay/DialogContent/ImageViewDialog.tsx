/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */

export function ImageViewDialog({ data }: { data: { title: string; image?: string } }) {
  return (
    <div className="flex h-full w-full select-none flex-col items-center justify-center gap-y-2">
      <img
        alt="preview"
        className="cursor-default object-contain"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        src={data?.image}
      />
      <h4 className="bottom-0 font-merriweather text-4xl text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] ">{data.title}</h4>
    </div>
  );
}
