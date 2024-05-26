/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { ColumnDef } from "@tanstack/react-table";
import { useAtomValue, useSetAtom } from "jotai";
import { useNavigate, useParams } from "react-router-dom";

import {
  BlueprintInstanceBlueprintFieldType,
  MetaType,
  RequestPaginationType,
  SetFavoriteType,
  TableDispatch,
  TagType,
} from "../../../types";
import {
  drawerAtom,
  FavoritesFilters,
  getAvatarInitials,
  getDeletedAtParams,
  getImageURL,
  IconEnum,
  projectFeatureFlagsAtom,
  sortTags,
  TagFilters,
} from "../../../utils";
import { Alert, Avatar, Badge, Button, Card, Checkbox, Dropdown, Tooltip } from "../..";

export function SelectColumn(dispatch: TableDispatch, pagination?: RequestPaginationType): ColumnDef<any> {
  return {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        isDisabled={table.getRowCount() === 0}
        name="selectAll"
        onChange={({ value }) => {
          if (value) {
            dispatch({
              type: "selectAll",
              payload: { rows: table.getPaginationRowModel().flatRows.map((row) => row.original.id) },
            });
          } else {
            dispatch({ type: "clearSelection" });
          }
        }}
        value={
          table.getPaginationRowModel().flatRows.length ===
          (table.options.meta as MetaType)?.selection?.[pagination?.page || 0]?.length
        }
      />
    ),

    cell: ({ table, row }) => (
      <Checkbox
        name={row.id}
        onChange={() => dispatch({ type: "setSelection", payload: { row: row.original.id } })}
        value={((table.options.meta as MetaType)?.selection?.[pagination?.page || 0] || []).includes(row.original.id)}
      />
    ),
    meta: {
      centered: true,
    },
  };
}

export function FavoriteColumn(setFavorite: (data: SetFavoriteType) => void): ColumnDef<any> {
  return {
    id: "is_favorite",
    header: "",
    cell: ({ row }) => (
      <Button
        hasNoBackground
        icon={IconEnum.star}
        iconThickness={row.original?.is_favorite ? "fill" : "regular"}
        onClick={async () => setFavorite(row.original)}
      />
    ),
    meta: {
      filterOptions: FavoritesFilters,
      centered: true,
    },
  };
}

export function TagColumn(hasTagsWarning?: boolean, dispatch?: TableDispatch): ColumnDef<any & { tags: TagType[] }> {
  const featureFlags = useAtomValue(projectFeatureFlagsAtom);

  return {
    id: "tags",
    header: "Tags",
    meta: {
      noLink: true,
      filterOptions: TagFilters,
      isRelationFilter: true,
    },
    minSize: 12,
    maxSize: 12,
    cell: ({ row }) => {
      const sortedTags = featureFlags?.sort_tags_alphabetically ? row.original?.tags?.sort(sortTags) : row.original?.tags;

      return (
        <div className="flex w-full max-w-full items-center justify-center gap-x-2">
          {sortedTags?.length ? (
            <div
              className="w-fit"
              onClick={() => {
                if (dispatch) {
                  dispatch({ type: "clearAllFilters" });
                  dispatch({
                    type: "setRelationFilter",
                    payload: {
                      and: [
                        {
                          id: crypto.randomUUID(),
                          field: "tags",
                          value: row.original.tags[0].id,
                          operator: "in",
                          header_name: "Tags",
                          relationalData: {
                            value: row.original.tags[0].id,
                            label: row.original.tags[0].title,
                            image: "",
                            blueprint_field_id: "tags",
                          },
                        },
                      ],
                    },
                  });
                }
              }}>
              <Badge customColor={row.original.tags[0].color} label={row.original.tags[0].title} />
            </div>
          ) : null}
          {sortedTags?.length > 1 ? (
            <Tooltip
              arrowColor="#3f3f46"
              content={
                <Card title="Additional tags">
                  <div className="grid max-w-48 grid-cols-2 gap-2 overflow-auto">
                    {row.original.tags.slice(1).map((tag: TagType) => (
                      <div
                        className="col-span-1 cursor-pointer"
                        onClick={() => {
                          if (dispatch) {
                            dispatch({ type: "clearAllFilters" });
                            dispatch({
                              type: "setRelationFilter",
                              payload: {
                                and: [
                                  {
                                    id: crypto.randomUUID(),
                                    field: "tags",
                                    value: tag.id,
                                    operator: "in",
                                    header_name: "Tags",
                                    relationalData: {
                                      value: tag.id,
                                      label: tag.title,
                                      image: "",
                                      blueprint_field_id: "tags",
                                    },
                                  },
                                ],
                              },
                            });
                          }
                        }}>
                        <Badge customColor={tag.color} label={tag.title} />
                      </div>
                    ))}
                  </div>
                </Card>
              }
              isPortal>
              <div className="w-min max-w-min">
                <Badge label={`+${row.original.tags.length - 1}`} size="sm" variant="secondary" />
              </div>
            </Tooltip>
          ) : null}
          {sortedTags?.length === 0 && hasTagsWarning ? <Alert label="There are no tags." variant="error-bordered" /> : null}
        </div>
      );
    },
  };
}
export function ArkivedAtColumn(): ColumnDef<any & { deleted_at: string | null }> {
  return {
    id: "deleted_at",
    header: "",
    meta: {
      centered: true,
      noLink: true,
    },
    cell: ({ row }) => {
      const params = getDeletedAtParams(row.original.deleted_at);
      return (
        <Tooltip content={params.tooltip} isDisabled={!params.tooltip}>
          <div>
            <Button
              hasNoBackground
              icon={IconEnum.archive}
              isIconOnly
              onClick={undefined}
              variant={params.isSoonToBeDeleted ? "error" : "primary"}
            />
          </div>
        </Tooltip>
      );
    },
    minSize: 3.25,
    maxSize: 3.25,
  };
}

export function ShowMultipleWithBadge({ titles }: { titles: string[] }) {
  return (
    <div className="flex max-w-full items-center gap-x-2">
      <div className="max-w-full truncate">{titles?.[0]}</div>
      {titles?.length > 1 ? (
        <Tooltip
          content={titles
            ?.slice(1)
            ?.map((title) => title)
            .join(", ")}
          isPortal>
          <div className="w-min max-w-min">
            <Badge label={`+${titles.length - 1}`} size="sm" variant="secondary" />
          </div>
        </Tooltip>
      ) : null}
    </div>
  );
}

export function CharacterColumn({ characters }: { characters: BlueprintInstanceBlueprintFieldType["characters"] }) {
  const { project_id } = useParams();
  return (
    <div className="flex w-full items-center gap-x-2">
      <div className="z-0 flex w-full items-center justify-center -space-x-4">
        {characters?.slice(0, 5)?.map((char) => {
          return (
            <Avatar
              key={char?.related_id}
              image={getImageURL(
                char?.character?.project_id || (project_id as string),
                "images",
                char?.character?.portrait_id || "",
              )}
              initials={getAvatarInitials(char?.character?.full_name || "")}
              isBordered
              label={char?.character?.full_name || ""}
              size="sm"
              tooltipAllowedPlacements={["left", "right"]}
            />
          );
        })}
      </div>
      {characters && characters?.length && characters?.length > 5 ? (
        <Tooltip
          content={characters
            ?.slice(5)
            ?.map((char) => char?.character?.full_name || "")
            ?.join(", ")}>
          <div className="w-min max-w-min">
            <Badge label={`+${characters.length - 5}`} size="sm" variant="secondary" />
          </div>
        </Tooltip>
      ) : null}
    </div>
  );
}

export function LocationColumn({ locations }: { locations: BlueprintInstanceBlueprintFieldType["map_pins"] }) {
  const { project_id } = useParams();
  const navigate = useNavigate();
  const setDrawer = useSetAtom(drawerAtom);

  return (
    <div className="group flex w-full max-w-full items-center gap-x-2 truncate">
      <ShowMultipleWithBadge titles={(locations || [])?.map((l) => l?.map_pin?.title || "")} />
      <Dropdown
        allowedPlacements={["left-start"]}
        items={(locations || []).map((location) => {
          const map_pin = "related_id" in location ? location.map_pin : location;
          return {
            id: map_pin?.id,
            title: map_pin?.title || "",
            icon: map_pin?.icon,
            subItems: [
              {
                id: `go_to_${map_pin?.id}`,
                title: `Go to ${map_pin?.title}`,
                onClick: () => navigate(`/projects/${project_id}/maps/${map_pin?.parent_id}/${map_pin?.id}`),
              },
              {
                id: `preview_${map_pin?.id}`,
                title: `Preview ${map_pin?.title} map`,
                onClick: () =>
                  setDrawer((prev) => ({
                    ...prev,
                    type: "entity_preview",
                    size: "half",
                    title: "Preview map",
                    data: { parent_id: map_pin?.parent_id, id: map_pin?.id, entity_type: "map_pins" },
                  })),
              },
            ],
          };
        })}>
        <div className="pointer-events-none w-min max-w-min opacity-0 transition-all group-hover:pointer-events-auto group-hover:opacity-100">
          <Button hasNoBackground icon={IconEnum.chevron_down} iconSize={14} isIconOnly onClick={undefined} size="2xs" />
        </div>
      </Dropdown>
    </div>
  );
}

export function EventColumn({ locations: events }: { locations: BlueprintInstanceBlueprintFieldType["events"] }) {
  const { project_id } = useParams();
  const navigate = useNavigate();
  const setDrawer = useSetAtom(drawerAtom);

  return (
    <div className="group flex w-full max-w-full items-center gap-x-2 truncate">
      <ShowMultipleWithBadge titles={(events || [])?.map((e) => e?.event?.title).filter((l) => !!l)} />
      <Dropdown
        allowedPlacements={["left-start"]}
        items={(events || []).map((e) => {
          const event = "related_id" in e ? e.event : e;
          return {
            id: event?.id,
            title: event?.title || "",
            subItems: [
              {
                id: `go_to_${event?.id}`,
                title: `Go to ${event?.title}`,
                onClick: () => navigate(`/projects/${project_id}/calendars/${event?.parent_id}/${event?.id}`),
              },
              {
                id: `preview_${event?.id}`,
                title: `Preview event ${event?.title}`,
                onClick: () =>
                  setDrawer((prev) => ({
                    ...prev,
                    type: "entity_preview",
                    size: "half",
                    title: `Preview event - ${event?.title}`,
                    data: { id: event?.id, parent_id: event?.parent_id, entity_type: "events" },
                  })),
              },
            ],
          };
        })}>
        <div className="pointer-events-none w-min max-w-min opacity-0 transition-all group-hover:pointer-events-auto group-hover:opacity-100">
          <Button hasNoBackground icon={IconEnum.chevron_down} iconSize={14} isIconOnly onClick={undefined} size="2xs" />
        </div>
      </Dropdown>
    </div>
  );
}
