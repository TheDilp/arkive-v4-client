import { useResetAtom } from "jotai/utils";
import omit from "lodash.omit";
import { useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateSubEntities } from "../../../hooks";
import { DefaultNode, drawerAtom, IconEnum } from "../../../utils";
import { EntityPreview } from "../../DataDisplay";
import { Button, Search } from "../../Form";
import { DrawerLayout } from "../../Layout";

type NodeFromType = "nodes_from_characters" | "nodes_from_images";

function getEntityFromType(type: NodeFromType) {
  if (type === "nodes_from_characters") return "characters";
  if (type === "nodes_from_images") return "images";
  return "characters";
}

export function NodeFromDrawer({ data: { type } }: { data: { type: NodeFromType } }) {
  const { item_id } = useParams();

  const entity = getEntityFromType(type);

  const { mutate: createNodes, isLoading: isMutating } = useCreateSubEntities("nodes", item_id as string);
  const resetDrawer = useResetAtom(drawerAtom);
  const [selectedItems, setSelectedItems] = useState<{ label: string; id: string; image_id: string | undefined }[]>([]);

  return (
    <DrawerLayout>
      <Search
        isMultiple
        limit={10}
        name={entity}
        onChange={({ label, image, value }) =>
          setSelectedItems((prev) =>
            prev.concat([{ id: value, image_id: type === "nodes_from_characters" ? image : value, label: label as string }]),
          )
        }
        searchEntity={entity}
        value={selectedItems.map((c) => c.id)}
      />
      <div className="flex max-h-96 flex-col gap-y-1 overflow-y-auto">
        {selectedItems.map((char, i) => (
          <EntityPreview
            key={char.id}
            clearAction={() => setSelectedItems((prev) => prev.toSpliced(i, 1))}
            id={char.id}
            image_id={char.image_id}
            title={char.label}
            type={entity}
          />
        ))}
      </div>

      <Button
        icon={IconEnum.add}
        isDisabled={isMutating}
        isLoading={isMutating}
        label="Create"
        onClick={() => {
          const node = omit(DefaultNode, ["tags", "background_image"]);
          createNodes(
            {
              data: selectedItems.map((item) => ({
                data: {
                  ...node,
                  x: 0,
                  y: 0,
                  image_id: item.image_id || null,
                  id: crypto.randomUUID(),
                  character_id: type === "nodes_from_characters" ? item.id : null,
                  label: item.label,
                  parent_id: item_id as string,
                },
              })),
            },
            {
              onSuccess: () => resetDrawer(),
            },
          );
        }}
        variant="success"
      />
    </DrawerLayout>
  );
}
