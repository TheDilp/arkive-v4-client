import { useResetAtom } from "jotai/utils";
import { useState } from "react";

import { useCreateProject, useHandleChange } from "../../../hooks";
import { drawerAtom, IconEnum } from "../../../utils";
import { InsertProjectSchema, InsertProjectType } from "../../../validation/project";
import { Button, Input } from "../../Form";

export function ProjectDrawer({ data }: { data: InsertProjectType | null }) {
  const ownerId = localStorage.getItem("ownerId");
  const [project, setProject] = useState<InsertProjectType>({ ...(data || { title: "" }), owner_id: ownerId as string });
  const { handleChange } = useHandleChange({ data: project, setData: setProject });
  const { mutateAsync, isLoading: isMutating } = useCreateProject<InsertProjectType>();
  const resetDrawerAtom = useResetAtom(drawerAtom);
  return (
    <>
      <Input
        label="Project title"
        name="title"
        onChange={handleChange}
        placeholder="New project"
        value={project?.title || ""}
      />

      <Button
        icon={IconEnum.add}
        isDisabled={!project?.title || isMutating}
        isLoading={isMutating}
        label="Create project"
        onClick={async () => {
          if (project) {
            const parsed = InsertProjectSchema.parse(project);
            await mutateAsync(parsed, {
              onSuccess: resetDrawerAtom,
            });
          }
        }}
        variant="success"
      />
    </>
  );
}
