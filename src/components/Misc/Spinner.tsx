import { IconEnum } from "../../utils";
import { Icon } from "./Icon";

type Props = {};

export function Spinner({}: Props) {
  return (
    <div className="animate-spin">
      <Icon icon={IconEnum.loading} />
    </div>
  );
}
