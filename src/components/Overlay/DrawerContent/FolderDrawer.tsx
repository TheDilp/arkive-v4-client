import { useResetAtom } from "jotai/utils";
import { useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateEntity, useHandleChange } from "../../../hooks";
import { AvailableEntityType } from "../../../types";
import { drawerAtom, IconEnum } from "../../../utils";
import { Button, Input } from "../../Form";

type Props = {
  data: {
    id?: string;
    type: AvailableEntityType;
  };
};

export function FolderDrawer({ data }: Props) {
  const { project_id } = useParams();
  const [folder, setFolder] = useState({ title: "", is_folder: true, project_id: project_id as string });

  const { mutateAsync: createFolder } = useCreateEntity(data.type);
  const resetDrawerAtom = useResetAtom(drawerAtom);
  const { changedData, handleChange } = useHandleChange({ data: folder, setData: setFolder });
  return (
    <div className="flex flex-col gap-y-2">
      <Input label="Title (required)" name="title" onChange={handleChange} value={folder.title} />
      <Button
        icon={data?.id ? IconEnum.save : IconEnum.add}
        // isDisabled={isSaveDisabled({ title: document?.title }) || isCreating || isUpdating}
        // isLoading={isCreating || isUpdating}
        label={data?.id ? "Update" : "Create"}
        onClick={async () => {
          if (changedData) {
            await createFolder(
              { data: folder },
              {
                onSuccess: resetDrawerAtom,
              },
            );
          }
          //     if (document?.id) {
          //       // eslint-disable-next-line @typescript-eslint/no-unused-vars
          //       const documentToUpdate = { ...(changedData || {}), id: document.id };
          //       const { alter_names, tags, ...rest } = documentToUpdate;
          //       const parsedData = UpdateDocumentSchema.parse({
          //         data: rest,
          //         relations: { tags, alter_names },
          //       });
          //       await update(parsedData, {
          //         onSuccess: (res) => {
          //           // if (res?.ok) resetDrawerAtom();
          //         },
          //       });
          //     } else {
          //       const dataToParse = {
          //         data: document,
          //         relations: {
          //           alter_names: document?.alter_names,
          //           tags: document?.tags,
          //         },
          //       };
          //       const parsedData = InsertDocumentSchema.parse(dataToParse);
          //       await create(parsedData, {
          //         onSuccess: (res) => {
          //           // if (res?.ok) resetDrawerAtom();
          //         },
          //       });
          //     }
          //   } else {
          //     createNotification({
          //       variant: "info",
          //       icon: IconEnum.info_circle,
          //       title: "No data was changed.",
          //       timer: 3,
          //     });
          //   }
        }}
        variant="success"
      />
    </div>
  );
}
