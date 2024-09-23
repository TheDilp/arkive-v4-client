import { Navigate, useParams } from "react-router-dom";

import { AdditionalBlueprintFieldDisplay, Collapsible, Skeleton } from "../../../components";
import { useGetEntity, useGetSubEntity } from "../../../hooks";
import { BlueprintInstanceType, BlueprintType } from "../../../types";
import { IconEnum, useNotifications } from "../../../utils";
import { PublicEntityLayout } from "./PublicLayout";

export function PublicBlueprint() {
  const { project_id, item_id } = useParams();
  const createNotification = useNotifications();
  const {
    data: blueprint_instance,
    error,
    isInitialLoading,
  } = useGetSubEntity<BlueprintInstanceType>(
    item_id,
    "blueprint_instances",
    {
      data: { id: item_id },
      fields: ["id", "title", "is_public", "parent_id"],
      relations: {
        blueprint_fields: true,
        tags: true,
      },
    },
    { staleTime: 3 * 60 * 1000 }
  );

  const { data: blueprint, isInitialLoading: isInitialLoadingBlueprint } = useGetEntity<BlueprintType>(
    blueprint_instance?.data?.parent_id,
    "blueprints",
    {
      data: {
        id: blueprint_instance?.data?.parent_id,
      },
      fields: ["id", "title", "title_name", "icon"],
      relations: {
        random_table_options: true,
        blueprint_fields: true,
      },
    },
    {
      enabled: !!blueprint_instance?.data?.parent_id && blueprint_instance?.data?.is_public,

      staleTime: 3 * 60 * 1000,
    }
  );

  if (!blueprint_instance?.data) return <Skeleton type="character_profile_main" />;
  if ((!blueprint_instance?.data?.is_public || error) && !isInitialLoading && !isInitialLoadingBlueprint) {
    createNotification({ title: "This entity is not public.", variant: "error", icon: IconEnum.error, timer: 3 });
    return <Navigate to={`/${project_id}/blueprints`} />;
  }
  return (
    <PublicEntityLayout title={blueprint_instance?.data?.title || ""}>
      <div className="flex flex-col px-2">
        <Collapsible icon={IconEnum.additional_fields} initialOpen label="Fields">
          <div className="animate-in fade-in fill-mode-both flex flex-col gap-y-2 overflow-y-auto p-2">
            {blueprint_instance?.data
              ? blueprint_instance?.data?.blueprint_fields
                  ?.toSorted((a, b) => a.sort - b.sort)
                  .map((blueprint_field) => {
                    const blueprintField = blueprint?.data?.blueprint_fields?.find((field) => field.id === blueprint_field.id);
                    if (!blueprintField || !blueprint_field) return null;
                    return (
                      <AdditionalBlueprintFieldDisplay
                        key={blueprint_field.id}
                        blueprint_field={blueprintField}
                        blueprint_field_data={blueprint_field}
                        isPreview={!!item_id}
                      />
                    );
                  })
              : null}
          </div>
        </Collapsible>
      </div>
    </PublicEntityLayout>
  );
}
