import { useResetAtom } from "jotai/utils";
import { useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateEntity, useHandleChange } from "../../../hooks";
import { CharacterRelationshipType } from "../../../types";
import { drawerAtom, IconEnum } from "../../../utils";
import { InsertCharacterRelationshipSchema } from "../../../validation";
import { Button, Input, Title } from "../../Form";

function isSaveDisabled(relationship_type: Partial<CharacterRelationshipType>) {
  if (!relationship_type?.title) return true;
  if (relationship_type?.ascendant_title && !relationship_type?.descendant_title) return true;
  if (!relationship_type?.ascendant_title && relationship_type?.descendant_title) return true;
  return false;
}

export function CharacterRelationshipTypeDrawer() {
  const { project_id } = useParams();
  const [relationshipType, setRelationshipType] = useState<Partial<CharacterRelationshipType>>({ project_id });
  const resetAtom = useResetAtom(drawerAtom);
  const { handleChange } = useHandleChange({ data: relationshipType, setData: setRelationshipType });
  const { mutateAsync: createRelationshipType, isLoading: isCreating } = useCreateEntity("character_relationship_types");

  async function handleSave() {
    const parsedData = InsertCharacterRelationshipSchema.parse({ data: relationshipType });
    await createRelationshipType(parsedData, { onSuccess: resetAtom });
  }

  return (
    <div className="flex flex-col gap-y-2">
      <Input
        helperText="Note: If ascendant and descendant titles are left blank, the title will be used for the relationship name."
        label="Title (required, must be unique)"
        name="title"
        onChange={handleChange}
        value={relationshipType?.title || ""}
      />
      <Input
        label="Ascendant title (optional)"
        name="ascendant_title"
        onChange={handleChange}
        value={relationshipType?.ascendant_title || ""}
      />
      <Input
        label="Descendant title (optional)"
        name="descendant_title"
        onChange={handleChange}
        value={relationshipType?.descendant_title || ""}
      />

      <div className="flex w-full flex-col gap-y-2">
        <Title isDrawerTitle label="Example" size="sm" />
        <div className="text-zinc-400">
          <span>Character A is a/the </span>
          <span className="italic text-white">
            {relationshipType?.ascendant_title || relationshipType?.title || "ascendant (eg. parent)"}{" "}
          </span>
          <span>of character B.</span>
        </div>
        <div className="text-zinc-400">
          <span>Character B is a/the </span>
          <span className="italic text-white">
            {relationshipType?.descendant_title || relationshipType?.title || "descendant (eg. child)"}{" "}
          </span>
          <span>of character A.</span>
        </div>
      </div>
      <Button
        icon={IconEnum.save}
        isDisabled={isCreating || isSaveDisabled(relationshipType)}
        isLoading={isCreating}
        label="Save"
        onClick={handleSave}
        variant="success"
      />
    </div>
  );
}
