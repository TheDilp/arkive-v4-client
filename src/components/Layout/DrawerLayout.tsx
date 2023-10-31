import { ReactNode } from "react";

type Props = {
  children: ReactNode | ReactNode[] | null;
};

export function DrawerLayout({ children }: Props) {
  return <div className="flex flex-col gap-y-2">{children}</div>;
}
