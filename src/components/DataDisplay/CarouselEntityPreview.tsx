import { useSetAtom } from "jotai";
import { useParams } from "react-router-dom";

import { AvailableEntityType, ItemPreviewType } from "../../types";
import { drawerAtom, getSearchLink } from "../../utils";
import { EntityPreview } from "./EntityPreview";

type Props = {
  items: ItemPreviewType[];
  field_label: string;
};

export function CarouselEntityPreview({ items, field_label }: Props) {
  const { project_id } = useParams();
  const setDrawer = useSetAtom(drawerAtom);

  return (
    <>
      <span className="col-span-6 text-sm text-zinc-200">{field_label}</span>
      {items.map((item) => (
        <div key={item?.id} className="col-span-2 xs:col-span-6 sm:col-span-2">
          <EntityPreview
            icon={item ? item?.icon : undefined}
            id={item?.id}
            image_id={item?.image_id}
            link={getSearchLink(project_id as string, item.type, item.id, item.parent_id)}
            previewAction={
              items.length
                ? (id, parent_id) => {
                    setDrawer((prev) => ({
                      ...prev,
                      title: "Preview",
                      data: { id, parent_id, entity_type: item.type as AvailableEntityType },
                      type: "entity_preview",
                      size: "half",
                    }));
                  }
                : undefined
            }
            title={item.title}
            type={item.type}
            variant="primary"
          />
        </div>
      ))}
    </>
  );
}
