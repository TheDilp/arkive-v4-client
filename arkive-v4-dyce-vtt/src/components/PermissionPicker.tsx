import { capitalize } from "remirror";

import { Button } from "../../../components";
import { GamePermissionsEnum } from "../../../utils";

export function PermissionPicker() {
  return (
    <div className="grid grid-cols-4 gap-x-2 rounded-md bg-black p-4 shadow">
      {GamePermissionsEnum.map((perm) => (
        <Button key={perm} label={capitalize(perm)} onClick={undefined} />
      ))}
    </div>
  );
}
