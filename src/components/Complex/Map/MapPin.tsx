import { useSetAtom } from "jotai";
import L, { LatLngExpression } from "leaflet";
import { useState } from "react";
import ReactDOM from "react-dom/server";
import { Marker, Tooltip } from "react-leaflet";
import { useNavigate, useParams } from "react-router-dom";

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
    doc_id,
    map_link,
    character,
    character_id,
    is_public,
  } = markerData;
  const navigate = useNavigate();
  const { project_id } = useParams();
  const { mutate: updateMapPin } = useUpdateMapSubEntity<{ data: Partial<MapPinType> }>("map_pins", map_id);
  const [position, setPosition] = useState<LatLngExpression>([lat, lng]);
  const setContextMenu = useSetAtom(contextMenuAtom);
  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);
  const isCharacterPin = !!character_id && !!character;
  const eventHandlers = {
    click: (e: any) => {
      if (e.originalEvent.shiftKey && e.originalEvent.altKey) return;
      if (!e.originalEvent.shiftKey && !e.originalEvent.altKey && !e.originalEvent.metaKey) {
        if (doc_id) {
          // setDrawer((prev) => ({
          //   type: "content_preview",
          //   data: { id: doc_id, type: "documents" },
          //   show: true,
          //   drawerSize: "md",
          //   exceptions: {
          //     isReadOnly: isReadOnly,
          //   },
          //   modal: true,
          // }));
        }
      }
      if (e.originalEvent.shiftKey && map_link) {
        e.originalEvent.preventDefault();
        if (isReadOnly) navigate(`/public/maps/${map_link}`);
        else navigate(`/projects/${project_id}/maps/${map_link}`);
      } else if (e.originalEvent.altKey && doc_id) {
        e.originalEvent.preventDefault();
        if (isReadOnly) navigate(`/public/documents/${doc_id}`);
        else navigate(`/projects/${project_id}/documents/${doc_id}`);
      } else if (e.originalEvent.metaKey) {
        // setDrawer({
        //   ...DefaultDrawer,
        //   type: "content_preview",
        //   data: { id: "", type: "screens" },
        //   show: true,
        //   drawerSize: "lg",
        //   modal: true,
        // });
      }
    },
    contextmenu: (e: any) => {
      if (!isReadOnly && !isViewOnly) {
        setContextMenu({
          event: e.originalEvent as any,
          items: [
            {
              id: "1",
              title: "Edit pin",
              icon: IconEnum.edit,
              onClick: () =>
                setDrawer((prev) => ({
                  ...prev,
                  type: "map_pins",
                  data: markerData,
                  exceptions: { characterPin: !!character && !!character_id },
                })),
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
          ],
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
            className={`fixed rounded-full ${isCharacterPin ? "h-7 w-7" : "h-10 w-10"}`}
            style={{
              background: image_id ? "" : background,
              backgroundImage:
                image_id || (isCharacterPin && character?.portrait_id)
                  ? `url(${getImageURL(project_id as string, "images", image_id || character.portrait_id)})`
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
        iconAnchor: isCharacterPin ? [30, 46] : [25.5, 46],
        iconSize: isCharacterPin ? [28, 28] : [40, 40],
        tooltipAnchor: isCharacterPin ? [-16, -46] : [-4, -46],
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
