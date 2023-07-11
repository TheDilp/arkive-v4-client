import { DividerType } from "../../types";

export function Divider({ label }: DividerType) {
  return (
    <div className="font-lato inline-flex h-min w-full items-center justify-center">
      <hr className="my-2 h-px w-full border-0 bg-zinc-600" />
      {label ? (
        <span className="absolute left-1/2 -translate-x-1/2 bg-zinc-700 px-3 font-medium text-white">{label}</span>
      ) : null}
    </div>
  );
}
