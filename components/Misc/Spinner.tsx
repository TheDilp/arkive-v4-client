import { IconEnum } from "../../utils";
import { Icon } from "./Icon";

export function Spinner() {
  return <Icon className="animate-spin" icon={IconEnum.loading} />;
}
