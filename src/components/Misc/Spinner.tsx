import { IconEnum } from "../../utils";
import { Icon } from "./Icon";

export function Spinner() {
  return (
    <div className="animate-spin">
      <Icon icon={IconEnum.loading} />
    </div>
  );
}
