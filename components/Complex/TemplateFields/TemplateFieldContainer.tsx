import { Collapsible } from "../../Layout";

type Props = {
  isCollapsible?: boolean;
  isOpen?: boolean;
  children: JSX.Element | JSX.Element[] | null;
  label?: string;
};

export function TemplateFieldContainer({ isCollapsible, isOpen, children, label }: Props) {
  return isCollapsible ? (
    <Collapsible initialOpen={isOpen} label={label || ""}>
      <div className="p-2">{children}</div>
    </Collapsible>
  ) : (
    children
  );
}
