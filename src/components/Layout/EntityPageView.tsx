import { ReactNode } from "react";

export function EntityPageGrid({ children }: { children: ReactNode[] | null }) {
  return <div className="w-full flex-1 content-start gap-4 pt-0 lg:grid lg:grid-cols-5 lg:content-stretch">{children}</div>;
}

export function EntityPageNavigation({ children }: { children: ReactNode[] | null }) {
  return <div className="flex flex-col items-center gap-y-2 rounded-lg bg-zinc-800 p-4 lg:col-span-1">{children}</div>;
}
export function EntityPageContent({ children }: { children: ReactNode[] | null }) {
  return (
    <div className="flex h-[calc(100vh-15rem)] max-h-[calc(100vh-15rem)] flex-1 flex-col overflow-hidden rounded-lg bg-zinc-950 p-4 lg:col-span-4 lg:h-[calc(100vh-9.5rem)] lg:max-h-[calc(100vh-9.5rem)]">
      {children}
    </div>
  );
}
