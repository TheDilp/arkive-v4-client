import { useSetAtom } from "jotai";
import L, { LatLngExpression } from "leaflet";
import { useState } from "react";
import ReactDOM from "react-dom/server";
import { Marker, Tooltip } from "react-leaflet";
import { useNavigate, useParams } from "react-router-dom";

import { useUpdateMapSubEntity } from "../../../hooks";
import { MapPinType } from "../../../types";
import { contextMenuAtom, dialogAtom, drawerAtom, getImageURL, IconEnum } from "../../../utils";

export function MapPin({ map_id, pinData: markerData, readOnly }: { map_id: string; pinData: MapPinType; readOnly?: boolean }) {
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
    is_public,
  } = markerData;
  const navigate = useNavigate();
  const { project_id } = useParams();
  const { mutate: updateMapPin } = useUpdateMapSubEntity<{ data: Partial<MapPinType> }>("map_pins", map_id);
  const [position, setPosition] = useState<LatLngExpression>([lat, lng]);
  const setContextMenu = useSetAtom(contextMenuAtom);
  const setDrawer = useSetAtom(drawerAtom);
  const setDialog = useSetAtom(dialogAtom);

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
          //     isReadOnly: readOnly,
          //   },
          //   modal: true,
          // }));
        }
      }
      if (e.originalEvent.shiftKey && map_link) {
        e.originalEvent.preventDefault();
        if (readOnly) navigate(`/view/maps/${map_link}`);
        else navigate(`/project/${project_id}/maps/${map_link}`);
      } else if (e.originalEvent.altKey && doc_id) {
        e.originalEvent.preventDefault();
        if (readOnly) navigate(`/view/documents/${doc_id}`);
        else navigate(`/project/${project_id}/documents/${doc_id}}`);
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
      if (!readOnly) {
        setContextMenu({
          event: e.originalEvent as any,
          items: [
            {
              title: "Edit pin",
              icon: IconEnum.edit,
              onClick: () => setDrawer((prev) => ({ ...prev, type: "map_pins", data: markerData })),
            },
            {
              title: "Delete pin",
              icon: IconEnum.trash,
              onClick: () => {
                setDialog((prev) => ({
                  ...prev,
                  data: {
                    ...markerData,
                    entity_title: "map_pins",
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
      if (!readOnly) {
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
      draggable={!readOnly}
      eventHandlers={eventHandlers}
      icon={L.divIcon({
        className: "relative",
        html: ReactDOM.renderToString(
          <div className="relative">
            <div className="absolute h-12 w-12">
              <div
                className="fixed h-full w-full rounded-full p-4"
                style={{
                  background: image_id ? "" : background,
                  backgroundImage: image_id ? `url(${getImageURL(project_id as string, "images", image_id)})` : "",
                  backgroundColor: show_background ? background_color || "" : "",
                  backgroundPosition: "center",
                  backgroundSize: image_id ? "contain" : "2rem",
                  backgroundRepeat: "no-repeat",
                  border: show_border ? `${border_color} solid 3px` : "",
                  zIndex: 999999,
                }}
              />
            </div>
          </div>,
        ),
        iconAnchor: [30, 46],
        iconSize: [48, 48],
        tooltipAnchor: [-5, -46],
      })}
      position={position}>
      {title && (
        <Tooltip className="border-rounded-sm border-solid border-gray-800 bg-gray-800 p-2 text-lg text-white" direction="top">
          <div className="Lato text-center">{title}</div>
        </Tooltip>
      )}
    </Marker>
  );
}
