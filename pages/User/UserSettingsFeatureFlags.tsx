import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";

import { Button, Checkbox } from "../../components";
import { useGetUser, useHandleChange, useUpdateUser } from "../../hooks";
import { capitalizeFirstLetter, DefaultUserFeatureFlags, IconEnum } from "../../utils";

export function UserSettingsFeatureFlags() {
  const { user: authUser } = useUser();
  const { data: user } = useGetUser(
    { data: { auth_id: authUser?.id as string }, fields: ["id", "feature_flags"] },
    { queryKey: ["user", authUser?.id, "feature_flag_settings"], enabled: !!authUser?.id }
  );
  const { mutate: updateUser } = useUpdateUser(user?.data?.id as string, authUser?.id as string);

  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({});

  const { handleChange } = useHandleChange({ data: featureFlags, setData: setFeatureFlags });

  useEffect(() => {
    if (user?.data) {
      setFeatureFlags(user?.data?.feature_flags);
    }
  }, [user?.data]);

  return (
    <div className="flex flex-col gap-y-2">
      <div className="mt-2 w-fit self-end">
        <Button
          icon={IconEnum.save}
          label="Save"
          onClick={() =>
            updateUser({
              data: {
                feature_flags: featureFlags,
              },
            })
          }
          variant="success"
        />
      </div>
      <div className="flex flex-col bg-zinc-900">
        {DefaultUserFeatureFlags.map((entity) => (
          <div
            className="flex flex-nowrap items-center justify-between border-t border-zinc-700 p-2 first:border-t-0 hover:bg-zinc-800"
            key={entity}>
            <span>{capitalizeFirstLetter(entity.replaceAll("_", " "))}</span>
            <div className="flex w-fit flex-1 items-center justify-end gap-x-2 text-center">
              <Checkbox label="Enabled" name={entity} onChange={handleChange} value={featureFlags?.[entity]} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
