import { useParams } from "react-router-dom";

import { useGetEntity, useGetSubEntity } from "../../../hooks";
import { BlueprintInstanceType, BlueprintType } from "../../../types";

type Props = {
  data: { id?: string };
};

export function BlueprintInstanceDrawer({ data }: Props) {
  const { item_id } = useParams();
  useGetEntity<BlueprintType>(item_id, "blueprints", {
    data: {
      id: item_id,
    },
    relations: {
      blueprint_fields: true,
    },
  });

  useGetSubEntity<BlueprintInstanceType>(data?.id, "blueprint_instances", { data: {} }, { enabled: !!data?.id });
  //   console.log(blueprint, blueprintInstance);
  return <div className="flex w-full flex-col gap-y-2">BlueprintInstanceDrawer</div>;
}
