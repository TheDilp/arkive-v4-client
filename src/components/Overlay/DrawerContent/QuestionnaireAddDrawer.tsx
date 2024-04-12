import { useResetAtom } from "jotai/utils";
import { useState } from "react";

import { useAddToEntity } from "../../../hooks";
import { drawerAtom, IconEnum } from "../../../utils";
import { EntityPreview } from "../../DataDisplay";
import { Button, Search, Title } from "../../Form";
import { DrawerLayout } from "../../Layout";

type OptionType = { label: string; value: string; image?: string; color?: string; project_id?: string };
type AddToQuestionnaireType = { data: { characters: string[]; blueprint_instances: string[] } };
export default function QuestionnaireAddDrawer({ data }: { data: { id: string } }) {
  const [items, setItems] = useState<{ characters: OptionType[]; blueprint_instances: OptionType[] }>({
    characters: [],
    blueprint_instances: [],
  });
  const { mutateAsync: addToCharacter, isLoading: isMutating } = useAddToEntity<AddToQuestionnaireType>(
    data.id,
    "questionnaires",
    "",
  );
  const resetDrawer = useResetAtom(drawerAtom);
  return (
    <DrawerLayout>
      <Title isDrawerTitle label="Characters" size="xl" />
      <Search
        isGlobal
        isMultiple
        name="characters"
        onChange={async ({ label, value, image, color, project_id }) => {
          if (items.characters.some((i) => i.value === value)) return;

          if (label && value)
            setItems((prev) => ({
              characters: (prev.characters || []).concat({ label, image, value, color, project_id }),
              blueprint_instances: prev.blueprint_instances,
            }));
        }}
        placeholder="Press enter to search and add characters."
        searchEntity="characters"
        value={items.characters.map((i) => i.value)}
      />
      {items.characters.map((i) => (
        <EntityPreview
          key={i.value}
          clearAction={(id) =>
            setItems((prev) => ({
              characters: (prev.characters || []).filter((item) => item.value !== id),
              blueprint_instances: prev.blueprint_instances,
            }))
          }
          entity_project_id={i.project_id}
          icon={IconEnum.character}
          id={i.value}
          image_id={i?.image}
          title={i.label}
          type="characters"
        />
      ))}

      <Title isDrawerTitle label="Blueprint instances" size="xl" />
      <Search
        isGlobal
        isMultiple
        name="blueprint_instances"
        onChange={async ({ label, value, image, color, project_id }) => {
          if (items.blueprint_instances.some((i) => i.value === value)) return;

          if (label && value)
            setItems((prev) => ({
              blueprint_instances: (prev.blueprint_instances || []).concat({ label, image, value, color, project_id }),
              characters: prev.characters,
            }));
        }}
        placeholder="Press enter to search and add blueprint instances."
        searchEntity="blueprint_instances"
        value={items.blueprint_instances.map((i) => i.value)}
      />
      {items.blueprint_instances.map((i) => (
        <EntityPreview
          key={i.value}
          clearAction={(id) =>
            setItems((prev) => ({
              blueprint_instances: (prev.blueprint_instances || []).filter((item) => item.value !== id),
              characters: prev.characters,
            }))
          }
          entity_project_id={i.project_id}
          icon={IconEnum.blueprint}
          id={i.value}
          image_id={i?.image}
          title={i.label}
          type="blueprint_instances"
        />
      ))}
      <div className="mt-auto">
        <Button
          icon={IconEnum.add}
          isDisabled={isMutating || (items.characters.length === 0 && items.blueprint_instances.length === 0)}
          isLoading={isMutating}
          label="Save"
          onClick={async () => {
            if (items.characters.length || items.blueprint_instances.length) {
              const parsedPayload = {
                data: {
                  characters: items.characters.map((c) => c.value),
                  blueprint_instances: items.blueprint_instances.map((b) => b.value),
                },
              };
              await addToCharacter(parsedPayload, {
                onSuccess: resetDrawer,
              });
            }
          }}
          variant="success"
        />
      </div>
    </DrawerLayout>
  );
}
