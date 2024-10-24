import { ReactNode } from "react";
import { tv } from "tailwind-variants";

const basicInputClasses = tv({
  base: "col-span-1 md:col-span-1",
  variants: {
    isDrawer: {
      true: "lg:col-span-2",
      false: "lg:col-span-1",
    },
  },
});
export function FormFieldContainer({ isDrawer = false, children }: { isDrawer: boolean | undefined; children: ReactNode }) {
  return <div className={basicInputClasses({ isDrawer })}>{children}</div>;
}
