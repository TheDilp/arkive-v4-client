import { useSetAtom } from "jotai";
import { divIcon, LatLngExpression } from "leaflet";
import { useState } from "react";
import { renderToString } from "react-dom/server";
import { Marker, Tooltip } from "react-leaflet";
import { useParams } from "react-router-dom";

import { useUpdateMapSubEntity } from "../../../hooks";
import { useImageURL } from "../../../hooks/ui/useImageURL";
import { DropdownItemType, MapPinType, PreviewableEntities } from "../../../types";
import { contextMenuAtom, dialogAtom, drawerAtom, getAssetURL, IconEnum } from "../../../utils";

export function MapPin({
  map_id,
  pinData: markerData,
  isReadOnly,
  isViewOnly,
}: {
  map_id: string;
  pinData: MapPinType;
  isReadOnly?: boolean;
  isViewOnly?: boolean;
}) {
  const {
    id,
    icon,
    image_id,
    color,
    show_background,
    show_border,
    border_color,
    background_color,
    title,
    lat,
    lng,
    doc_id,
    map_link,
    character,
    character_id,
    is_public,
  } = markerData;
  const { project_id } = useParams();
  const { mutateAsync: updateMapPin, isLoading: isUpdating } = useUpdateMapSubEntity<{ data: Partial<MapPinType> }>(
    "map_pins",
    map_id
  );
  const [position, setPosition] = useState<LatLngExpression>([lat, lng]);
  const setContextMenu = useSetAtom(contextMenuAtom);
  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);
  const isCharacterPin = !!character_id && !!character;
  const eventHandlers = {
    dblclick: () => {
      if (!isReadOnly && !isViewOnly)
        setDrawer((prev) => ({
          ...prev,
          title: "Edit map pin",
          type: "map_pins",
          data: markerData,
          size: "lg",
          exceptions: { characterPin: !!character && !!character_id },
        }));
    },
    contextmenu: (e: any) => {
      if (!isReadOnly && !isViewOnly) {
        const contextItems: DropdownItemType[] = [
          {
            id: "1",
            title: "Edit pin",
            icon: IconEnum.edit,
            onClick: () =>
              setDrawer((prev) => ({
                ...prev,
                title: "Edit map pin",
                type: "map_pins",
                data: markerData,
                exceptions: { characterPin: !!character && !!character_id },
              })),
          },
          {
            id: "character_drawer",
            title: "Preview character",
            icon: IconEnum.character,
            isDisabled: !character_id,
            onClick: () => {
              if (character_id)
                setDrawer((prev) => ({
                  ...prev,
                  data: {
                    id: character_id,
                    entity_type: "characters",
                  },
                  title: "Preview character",
                  size: "half",
                  type: "entity_preview",
                }));
            },
          },
          {
            id: "document_drawer",
            title: "Preview document",
            icon: IconEnum.document,
            isDisabled: !doc_id,
            onClick: () => {
              if (doc_id)
                setDrawer((prev) => ({
                  ...prev,
                  data: {
                    id: doc_id,
                    entity_type: "documents" as PreviewableEntities,
                  },
                  title: "Preview document",
                  size: "half",
                  type: "entity_preview",
                }));
            },
          },
          {
            id: "map_drawer",
            title: "Preview map",
            icon: IconEnum.map,
            isDisabled: !map_link,
            onClick: () => {
              if (map_link)
                setDrawer((prev) => ({
                  ...prev,
                  data: {
                    id: map_link,
                    entity_type: "maps",
                  },
                  title: "Preview map",
                  size: "half",
                  type: "entity_preview",
                }));
            },
          },
          {
            id: "2",
            title: "Delete pin",
            icon: IconEnum.trash,
            onClick: () => {
              setDialog((prev) => ({
                ...prev,
                data: {
                  ...markerData,
                  entity_title: "map_pins",
                  title: markerData?.character?.full_name || markerData?.title,
                },
                title: "Delete map pin",
                size: "sm",
                type: "delete_entity",
              }));
            },
          },
        ];

        setContextMenu({
          event: e.originalEvent as any,
          items: contextItems,
        });
      }
    },
    async dragend(e: any) {
      if (!isReadOnly && !isViewOnly) {
        setPosition(e.target._latlng);
        await updateMapPin({
          data: {
            id,
            lat: e.target._latlng.lat,
            lng: e.target._latlng.lng,
            is_public,
          },
        });
      }
    },
  };
  const imageUrl = useImageURL(getAssetURL(project_id as string, "images", image_id || character?.portrait_id));
  const background = `url('https://api.iconify.design/${icon?.match(/.*:/g)?.[0]?.replace(":", "") || "mdi:"}/${
    icon ? icon?.replace(/.*:/g, "") : ""
  }.svg?color=%23${color ? color.replace("#", "") : ""}') no-repeat`;
  return (
    <Marker
      draggable={(!isReadOnly && !isViewOnly) || isUpdating}
      eventHandlers={eventHandlers}
      icon={divIcon({
        className: "relative",
        html: renderToString(
          <div
            className={`fixed rounded-full ${isCharacterPin ? "h-6 w-6" : "h-8 w-8"}`}
            style={{
              background: image_id ? "" : background,
              backgroundImage: image_id || (isCharacterPin && character?.portrait_id) ? `url(${imageUrl})` : "",
              backgroundColor: show_background ? background_color || "" : "",
              backgroundPosition: "center",
              backgroundSize: image_id || (isCharacterPin && !!character?.portrait_id) ? "contain" : "2rem",
              backgroundRepeat: "no-repeat",
              border: show_border ? `${border_color} solid ${isCharacterPin ? "1px" : "2px"}` : "",
              zIndex: 999999,
            }}
          />
        ),
        // iconAnchor: isCharacterPin ? [30, 46] : [25.5, 46],
        // iconSize: isCharacterPin ? [28, 28] : [40, 40],
        tooltipAnchor: isCharacterPin ? [6, -8] : [10.5, -6],
      })}
      position={position}>
      {title || isCharacterPin ? (
        <Tooltip direction="top">
          <div className="Lato text-center">{title || character?.full_name}</div>
        </Tooltip>
      ) : null}
    </Marker>
  );
}
