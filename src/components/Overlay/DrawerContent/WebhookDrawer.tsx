import { useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { useResetAtom } from "jotai/utils";
import { useLayoutEffect, useState } from "react";

import { useGetEntity, useHandleChange, useMutateWebhook } from "../../../hooks";
import { WebhookType } from "../../../types";
import { drawerAtom, IconEnum, userAtom } from "../../../utils";
import { InsertWebhookSchema, UpdateWebhookSchema } from "../../../validation/webhooks";
import { Button, Input } from "../../Form";
import { DrawerLayout } from "../../Layout";
import { Skeleton } from "../../Misc";

type Props = {
  data: { id?: string };
};

export function WebhookDrawer({ data }: Props) {
  const queryClient = useQueryClient();
  const user = useAtomValue(userAtom);
  const { data: existingWebhook, isInitialLoading } = useGetEntity<WebhookType>(
    data?.id,
    "webhooks",
    {
      data: {
        id: data.id,
      },
      fields: ["id", "title", "url", "user_id"],
    },
    { enabled: !!data?.id },
  );
  const { mutateAsync, isLoading: isCreating } = useMutateWebhook(data?.id ? "update" : "create", data?.id);
  const [webhook, setWebhook] = useState<WebhookType | null>();
  const { handleChange } = useHandleChange({ data: webhook, setData: setWebhook });
  const resetDrawer = useResetAtom(drawerAtom);
  useLayoutEffect(() => {
    if (existingWebhook?.data) {
      setWebhook(existingWebhook?.data);
    } else {
      setWebhook({ title: "New webhook", user_id: user?.id || "", url: "", id: crypto.randomUUID() });
    }
  }, [existingWebhook?.data]);

  if (isInitialLoading) return <Skeleton type="drawer_form" />;

  return (
    <DrawerLayout>
      <Input
        label="Webhook title"
        name="title"
        onChange={handleChange}
        placeholder="E.g. DnD group server"
        value={webhook?.title || ""}
      />
      <Input isDisabled={!!data?.id} label="Webhook url" name="url" onChange={handleChange} value={webhook?.url || ""} />
      <div>
        <Button
          icon={data?.id ? IconEnum.save : IconEnum.add}
          isDisabled={isCreating || !webhook?.title || !webhook?.url}
          isLoading={isCreating}
          label={data?.id ? "Update" : "Create"}
          onClick={async () => {
            if (!data?.id) {
              const parsedData = InsertWebhookSchema.parse({ data: webhook });
              await mutateAsync(parsedData);
            } else {
              const parsedData = UpdateWebhookSchema.parse({ data: webhook });
              await mutateAsync(parsedData);
            }
            resetDrawer();
            queryClient.invalidateQueries(["projects"]);
          }}
          variant="success"
        />
      </div>
    </DrawerLayout>
  );
}
