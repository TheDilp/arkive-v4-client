import { useResetAtom } from "jotai/utils";
import omit from "lodash.omit";
import { useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateSubEntities } from "../../../hooks";
import { DefaultNode, drawerAtom, IconEnum } from "../../../utils";
import { EntityPreview } from "../../DataDisplay";
import { Button, Search } from "../../Form";
import { DrawerLayout } from "../../Layout";

export function NodeFromCharactersDrawer() {
  const { item_id } = useParams();
  const { mutate: createNodes } = useCreateSubEntities("nodes", item_id as string);
  const resetDrawer = useResetAtom(drawerAtom);
  const [selectedCharacters, setSelectedCharacters] = useState<{ label: string; id: string; image_id: string | undefined }[]>(
    [],
  );

  return (
    <DrawerLayout>
      <Search
        isMultiple
        limit={10}
        name="characters"
        onChange={({ label, image, value }) =>
          setSelectedCharacters((prev) => prev.concat([{ id: value, image_id: image, label: label as string }]))
        }
        searchEntity="characters"
        value={selectedCharacters.map((c) => c.id)}
      />
      <div className="flex max-h-96 flex-col gap-y-1 overflow-y-auto">
        {selectedCharacters.map((char, i) => (
          <EntityPreview
            key={char.id}
            clearAction={() => setSelectedCharacters((prev) => prev.toSpliced(i, 1))}
            id={char.id}
            image_id={char.image_id}
            title={char.label}
            type="characters"
          />
        ))}
      </div>

      <Button
        icon={IconEnum.add}
        label="Create"
        onClick={() => {
          const node = omit(DefaultNode, ["tags", "background_image"]);
          createNodes(
            {
              data: selectedCharacters.map((char) => ({
                data: {
                  ...node,
                  x: 0,
                  y: 0,
                  image_id: char.image_id || null,
                  id: crypto.randomUUID(),
                  character_id: char.id,
                  label: char.label,
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
