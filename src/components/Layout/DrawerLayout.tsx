import { ReactNode } from "react";

type Props = {
  children: ReactNode | ReactNode[] | null;
};

export function DrawerLayout({ children }: Props) {
  // Button styles are for tab navs
  return <div className="flex h-full w-full flex-col gap-y-2 overflow-y-auto [&>div>ul>li>button]:bg-zinc-900">{children}</div>;
}
