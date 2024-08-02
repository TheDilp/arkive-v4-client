import { useAtomValue } from "jotai";
import { useLayoutEffect, useState } from "react";

import { AvatarUpload, Button, Input } from "../../components";
import { useHandleChange } from "../../hooks";
import { IconEnum, userAtom } from "../../utils";

export function UserSettingsProfile() {
  const userData = useAtomValue(userAtom);
  const [user, setUser] = useState(userData);
  const { handleChange } = useHandleChange({ data: user, setData: setUser });

  useLayoutEffect(() => {
    if (userData) setUser(userData);
  }, [userData]);
  return (
    <div className="grid grid-cols-4 gap-x-8 py-4">
      <div className="flex w-full items-center gap-x-2">
        <div className="relative ml-auto flex cursor-pointer items-center">
          <div className="absolute z-10 h-full w-full rounded-full bg-zinc-700 opacity-0 transition-all hover:opacity-50 active:opacity-70" />
          <AvatarUpload id={user?.id as string} image={user?.image} isUserAvatar project_id="" />
        </div>
        <Input
          label="Nickname (required)"
          name="nickname"
          onChange={handleChange}
          value={user?.nickname || ""}
          variant={user?.nickname ? "primary" : "error"}
        />
        <div className="mb-1 h-8 w-8 min-w-8 self-end">
          <Button
            icon={IconEnum.save}
            isDisabled={userData?.nickname === user?.nickname || !user?.nickname}
            isIconOnly
            onClick={undefined}
            variant="success"
          />
        </div>
      </div>
      <div className="flex w-full items-center gap-x-2">
        <Input
          label="Email (required)"
          name="email"
          onChange={handleChange}
          value={user?.email || ""}
          variant={user?.email ? "primary" : "error"}
        />
        <div className="mb-1 h-8 w-8 min-w-8 self-end">
          <Button
            icon={IconEnum.save}
            isDisabled={userData?.email === user?.email || !user?.email}
            isIconOnly
            onClick={undefined}
            variant="success"
          />
        </div>
      </div>
    </div>
  );
}
