import { useState } from "react";
import { useParams } from "react-router-dom";

import { useBulkUpdate, useHandleChange, useToggledResetAtom } from "../../../hooks";
import { EntitiesWithFolders, TableDispatch } from "../../../types";
import { IconEnum } from "../../../utils";
import { FolderSelect } from "../../Complex";
import { Button } from "../../Form";
import { DrawerLayout } from "../../Layout";
import { Icon } from "../../Misc";
import { Tooltip } from "../Tooltip";

type Props = {
  data: {
    items: { id: string; title: string }[];
    dispatch: TableDispatch<{ id: string; title: string }>;
    type: EntitiesWithFolders;
  };
};

export function BulkFolderDrawer({ data }: Props) {
  const { project_id } = useParams();
  const [folder, setFolder] = useState<{ parent_id: string | null }>({ parent_id: null });
  const { mutate } = useBulkUpdate(project_id as string, data.type);
  const { handleChange } = useHandleChange({ data: folder, setData: setFolder });
  const resetDrawer = useToggledResetAtom();
  function handleSave() {
    const itemsToUpdate = folder.parent_id ? data.items.filter((item) => item.id !== folder.parent_id) : data.items;
    mutate({ data: itemsToUpdate.map((item) => ({ data: { id: item.id, parent_id: folder.parent_id } })) });
    data.dispatch({ type: "clearSelection" });
    resetDrawer();
  }

  return (
    <DrawerLayout>
      <FolderSelect handleChange={handleChange} parent_id={folder?.parent_id ?? null} type={data.type} />
      <ul className="max-h-full flex-1 divide-y divide-zinc-600 overflow-auto">
        {data.items.map((item) => (
          <li
            className={`flex items-center justify-between py-1 ${folder.parent_id === item.id ? "text-zinc-500" : ""}`}
            key={item.id}>
            {item.title}
            <Tooltip content="Cannot move a folder into itself. This item will be ignored.">
              <span>{folder.parent_id === item.id ? <Icon color="white" icon={IconEnum.info_circle} /> : null}</span>
            </Tooltip>
          </li>
        ))}
      </ul>
      <Button icon={IconEnum.folder} label="Move" onClick={handleSave} variant="success" />
    </DrawerLayout>
  );
}
