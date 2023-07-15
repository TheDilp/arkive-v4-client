export interface CollapsibleType {
  label: string;
  children: JSX.Element | JSX.Element[] | null;
  initialOpen?: boolean;
}
