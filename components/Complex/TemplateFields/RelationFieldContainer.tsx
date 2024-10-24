import { ReactNode } from "react";
import { tv } from "tailwind-variants";

const classes = tv({
  base: "relative col-span-1 flex max-h-96 flex-col gap-y-2 overflow-y-auto",
  variants: {
    isMultiple: {},
    isGateway: {},
  },
  compoundVariants: [
    {
      isMultiple: true,
      isGateway: false,
      class: "md:col-span-2 lg:col-span-4",
    },
    {
      isMultiple: false,
      isGateway: false,
      class: "md:col-span-2",
    },
  ],
});

export function RelationFieldContainer({ isMultiple, children }: { isMultiple: boolean; children: ReactNode }) {
  return <div className={classes({ isMultiple, isGateway: IS_GATEWAY })}>{children}</div>;
}
