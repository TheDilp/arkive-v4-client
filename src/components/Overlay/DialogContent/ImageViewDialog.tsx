export function ImageViewDialog({ data }: { data: { image?: string } }) {
  return (
    <div className="flex h-full w-full justify-center">
      <img alt="preview" src={data?.image} />
    </div>
  );
}
