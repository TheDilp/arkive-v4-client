import { createColumnHelper } from "@tanstack/react-table";
import { SetStateAction, useSetAtom } from "jotai";
import { Dispatch, useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useGetEntities, useTable } from "../../../hooks";
import { DialogAtomType, MapPinType } from "../../../types";
import { dialogAtom, getImageURL, IconEnum } from "../../../utils";
import { Table } from "../../DataDisplay";
import { Button } from "../../Form";
import { Avatar, Icon } from "../../Misc";
import { Dropdown } from "../Dropdown";

const columnHelper = createColumnHelper<MapPinType>();

function getColumns(project_id: string, setDialog: Dispatch<SetStateAction<DialogAtomType>>) {
  return [
    columnHelper.display({
      id: "icon",
      header: "Icon",
      cell: ({ row }) => (
        <div className="flex w-full items-center justify-center">
          {row?.original?.character ? (
            <Avatar
              image={getImageURL(project_id, "images", row?.original?.character?.portrait_id)}
              label={row?.original?.character?.full_name}
              size="sm"
            />
          ) : (
            <Icon fontSize={32} icon={row?.original?.icon} />
          )}
        </div>
      ),
      minSize: 5,
      maxSize: 5,
    }),
    columnHelper.display({
      id: "title",
      header: "Icon title",
      cell: ({ row }) => (
        <div className="flex max-w-full items-center justify-start">
          <span className="truncate">{row.original?.title || row?.original?.character?.full_name || <i>No name.</i>}</span>
        </div>
      ),
      minSize: 5,
    }),

    columnHelper.display({
      id: "action",
      header: "Actions",
      meta: {
        centered: true,
      },
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Dropdown
            allowedPlacements={["left", "left-start", "left-end"]}
            items={[
              {
                id: "delete_map_pin",
                title: "Delete map pin",
                icon: IconEnum.trash,
                onClick: () => {
                  setDialog((prev) => ({
                    ...prev,
                    data: {
                      ...row.original,
                      entity_title: "map_pins",
                    },
                    title: "Delete map pin",
                    size: "sm",
                    type: "delete_entity",
                  }));
                },
              },
            ]}>
            <Button hasNoBackground icon={IconEnum.actions} iconSize={28} onClick={undefined} />
          </Dropdown>
        </div>
      ),
      maxSize: 2,
    }),
  ];
}

export function MapPinManagementDrawer({ data }: { data: { map_id: string } }) {
  const { project_id } = useParams();
  const { data: existingMapPins, isFetching } = useGetEntities<MapPinType>(
    {
      data: {
        project_id: project_id as string,
      },
      fields: [
        "id",
        "background_color",
        "border_color",
        "color",
        "character_id",
        "doc_id",
        "icon",
        "title",
        "parent_id",
        "is_public",
        "lat",
        "lng",
        "map_link",
        "show_background",
        "show_border",
        "map_pin_type_id",
      ],
      filters: { and: [{ id: "parent", header_name: "Parent", field: "parent_id", value: data?.map_id, operator: "eq" }] },
      relations: {
        character: true,
      },
    },
    "map_pins",
    { staleTime: 60 * 1000 },
  );
  const [, dispatch] = useTable({});
  const setDialog = useSetAtom(dialogAtom);
  const [mapPins, setMapPins] = useState<MapPinType[]>([]);
  const columns = getColumns(project_id as string, setDialog);
  useLayoutEffect(() => {
    if (existingMapPins?.data) {
      setMapPins(existingMapPins?.data);
    }
  }, [existingMapPins?.data]);

  return (
    <div className="flex h-[calc(100%-3rem)] max-h-[calc(100%-3rem)] flex-col gap-y-2 overflow-auto">
      <Table columns={columns} data={mapPins || []} dispatch={dispatch} isLoading={isFetching} type="icons" />
    </div>
  );
}
