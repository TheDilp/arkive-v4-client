import { useSetAtom } from "jotai";
import L, { LatLngExpression } from "leaflet";
import { useState } from "react";
import ReactDOM from "react-dom/server";
import { Marker, Tooltip } from "react-leaflet";
import { useParams } from "react-router-dom";

import { useUpdateMapSubEntity } from "../../../hooks";
import { MapPinType } from "../../../types";
import { contextMenuAtom, dialogAtom, drawerAtom, getImageURL, IconEnum } from "../../../utils";

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
    character,
    character_id,
    is_public,
  } = markerData;
  const { project_id } = useParams();
  const { mutate: updateMapPin } = useUpdateMapSubEntity<{ data: Partial<MapPinType> }>("map_pins", map_id);
  const [position, setPosition] = useState<LatLngExpression>([lat, lng]);
  const setContextMenu = useSetAtom(contextMenuAtom);
  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);
  const isCharacterPin = !!character_id && !!character;
  const eventHandlers = {
    dblclick: () =>
      setDrawer((prev) => ({
        ...prev,
        title: "Edit map pin",
        type: "map_pins",
        data: markerData,
        exceptions: { characterPin: !!character && !!character_id },
      })),
    contextmenu: (e: any) => {
      if (!isReadOnly && !isViewOnly) {
        const contextItems = [
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
        ];
        if (character_id) {
          contextItems.push({
            id: "character_drawer",
            title: "Show character",
            icon: IconEnum.character,
            onClick: () => {
              setDrawer((prev) => ({
                ...prev,
                data: {
                  id: character_id,
                },
                title: "Edit character",
                size: "lg",
                type: "characters",
              }));
            },
          });
        }
        contextItems.push({
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
        });
        setContextMenu({
          event: e.originalEvent as any,
          items: contextItems,
        });
      }
    },
    dragend(e: any) {
      if (!isReadOnly && !isViewOnly) {
        setPosition(e.target._latlng);
        updateMapPin({
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
  const background = `url('https://api.iconify.design/${icon?.match(/.*:/g)?.[0]?.replace(":", "") || "mdi:"}/${
    icon ? icon?.replace(/.*:/g, "") : ""
  }.svg?color=%23${color ? color.replace("#", "") : ""}') no-repeat`;
  return (
    <Marker
      draggable={!isReadOnly && !isViewOnly}
      eventHandlers={eventHandlers}
      icon={L.divIcon({
        className: "relative",
        html: ReactDOM.renderToString(
          <div
            className={`fixed rounded-full ${isCharacterPin ? "h-6 w-6" : "h-8 w-8"}`}
            style={{
              background: image_id ? "" : background,
              backgroundImage:
                image_id || (isCharacterPin && character?.portrait_id)
                  ? `url(${getImageURL(project_id as string, "images", image_id || character?.portrait_id)})`
                  : "",
              backgroundColor: show_background ? background_color || "" : "",
              backgroundPosition: "center",
              backgroundSize: image_id || (isCharacterPin && !!character?.portrait_id) ? "contain" : "2rem",
              backgroundRepeat: "no-repeat",
              border: show_border ? `${border_color} solid ${isCharacterPin ? "1px" : "2px"}` : "",
              zIndex: 999999,
            }}
          />,
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
