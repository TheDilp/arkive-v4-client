import { Collapsible } from "../../Layout";

type Props = {
  isCollapsible?: boolean;
  children: JSX.Element | JSX.Element[] | null;
  label?: string;
};

export function TemplateFieldContainer({ isCollapsible, children, label }: Props) {
  return isCollapsible ? (
    <Collapsible label={label || ""}>
      <div className="p-2">{children}</div>
    </Collapsible>
  ) : (
    children
  );
}

