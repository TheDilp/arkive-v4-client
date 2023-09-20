export function IndeterminateProgressBar() {
  return (
    <div className="absolute top-[3.825rem] w-full">
      <div className="h-0.5 w-full overflow-hidden bg-green-500">
        <div className="h-full w-full origin-left-right animate-progress bg-green-700" />
      </div>
    </div>
  );
}
