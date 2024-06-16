import { RangeType } from "../../types";

export function Range({ step, value, min, max, label, name, onChange }: RangeType) {
  return (
    <div className="flex w-full flex-col">
      {label ? <span className="mb-2 block min-h-[20px] truncate text-sm">{label}</span> : null}
      <input
        className="h-1 cursor-pointer appearance-none rounded-lg bg-zinc-700"
        max={max}
        min={min}
        name={name}
        onChange={(e) => onChange(e.target)}
        step={step}
        type="range"
        value={value}
      />
    </div>
  );
}
