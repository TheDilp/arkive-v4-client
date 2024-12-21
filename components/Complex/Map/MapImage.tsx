import { useSetAtom } from "jotai";
import { LatLngBoundsExpression } from "leaflet";
import { useEffect, useRef } from "react";
import { ImageOverlay, LayerGroup, LayersControl, useMap, useMapEvents } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { useParams } from "react-router-dom";

import { MapPinType, MapType, UserHasPermissionsType } from "../../../types";
import { contextMenuAtom, drawerAtom, IconEnum } from "../../../utils";
import { MapPin } from "./MapPin";

type Props = {
  mapData: MapType;
  src: string;
  bounds: number[][];
  imgRef: any;
  isReadOnly?: boolean;
  isViewOnly?: boolean;
  isClusteringPins: boolean;
  center_on?: string;
  mapPinFilters: string[];
  permissions: UserHasPermissionsType;
};

export function MapImage({
  mapData,
  src,
  bounds,
  imgRef,
  isReadOnly,
  isViewOnly,
  isClusteringPins,
  center_on,
  mapPinFilters,
  permissions,
}: Props) {
  const firstRender = useRef(true);
  const { item_id, subitem_id } = useParams();
  const setContextMenu = useSetAtom(contextMenuAtom);

  function PinFilter(mapPin: MapPinType) {
    if (mapPin.character_id) return true;
    if (mapPinFilters.includes("all")) return true;

    if (mapPinFilters.includes("linked_maps") && !!mapPin.map_link) {
      return true;
    }
    if (mapPinFilters.includes("documents") && !!mapPin.doc_id) {
      return true;
    }
    if (!mapPinFilters.includes("all") && mapPin.map_pin_type_id) {
      return mapPinFilters.includes(mapPin.map_pin_type_id);
    }
    return false;
  }

  const setDrawer = useSetAtom(drawerAtom);
  const map = useMap();
  const mapEvents = useMapEvents({
    contextmenu(e: any) {
      if (!isReadOnly && !isViewOnly) {
        setContextMenu({
          event: e.originalEvent,
          items: [
            {
              id: "1",
              icon: IconEnum.add,
              isDisabled: !permissions?.create_map_pins,
              title: "Add map pin",
              onClick: () => {
                setDrawer((prev) => ({
                  ...prev,
                  data: { lat: e.latlng.lat, lng: e.latlng.lng },
                  title: "Create new map pin",
                  type: "map_pins",
                }));
              },
            },
            {
              id: "2",
              isDisabled: !permissions?.create_map_pins,
              icon: IconEnum.character,
              title: "Add character pin",
              onClick: () => {
                setDrawer((prev) => ({
                  ...prev,
                  data: { lat: e.latlng.lat, lng: e.latlng.lng },
                  title: "Create new map pin",

                  type: "map_pins",
                  exceptions: {
                    characterPin: true,
                  },
                }));
              },
            },
            {
              id: "3",
              icon: IconEnum.center,
              title: "Center map",
              onClick: () => map.setView([bounds[1][0] / 2, bounds[1][1] / 2], map.getZoom()),
            },
            {
              id: "4",
              icon: IconEnum.fit,
              title: "Fit map to view",
              onClick: () => map.fitBounds(bounds as LatLngBoundsExpression),
            },
            {
              isDisabled: !permissions?.delete_map_pins,
              id: "5",
              icon: IconEnum.map_pin,
              title: "Manage pins",
              onClick: () => {
                setDrawer((prev) => ({
                  ...prev,
                  data: { lat: e.latlng.lat, lng: e.latlng.lng, map_id: item_id as string },
                  title: "Manage pins",
                  type: "map_pin_management",
                  size: "lg",
                }));
              },
            },
          ],
        });
      }
    },
  });

  useEffect(() => {
    if ((subitem_id || center_on) && mapData && firstRender.current) {
      const pin = mapData?.map_pins?.find((map_pin) => (center_on ? map_pin.id === center_on : map_pin.id === subitem_id));
      if (pin) mapEvents.panTo([pin.lat, pin.lng], {});
    } else if (bounds && firstRender.current) {
      // map.fitBounds(bounds);
    }
    return () => {
      firstRender.current = false;
    };
  }, [subitem_id, bounds]);

  if (!mapEvents || !src) return null;

  const { nonCharacterPins, characterPins }: { nonCharacterPins: MapPinType[]; characterPins: MapPinType[] } = (
    mapData?.map_pins || []
  ).reduce(
    (accumulator: { nonCharacterPins: MapPinType[]; characterPins: MapPinType[] }, currentValue) => {
      if (!!currentValue.character_id && !!currentValue.character) {
        accumulator.characterPins.push(currentValue);
      } else {
        accumulator.nonCharacterPins.push(currentValue);
      }
      return accumulator;
    },
    {
      nonCharacterPins: [],
      characterPins: [],
    }
  );
  return (
    <LayersControl position="topright">
      <LayersControl.BaseLayer checked name="Map">
        <ImageOverlay ref={imgRef} bounds={bounds as LatLngBoundsExpression} url={src} />
      </LayersControl.BaseLayer>
      {/* Characters layer */}
      <LayersControl.Overlay checked name="Character pins">
        {isClusteringPins ? (
          <MarkerClusterGroup chunkedLoading removeOutsideVisibleBounds showCoverageOnHover>
            {characterPins
              ?.filter(PinFilter)
              ?.map((pin) => (
                <MapPin key={pin.id} isReadOnly={isReadOnly} isViewOnly={isViewOnly} map_id={item_id as string} pinData={pin} />
              ))}
          </MarkerClusterGroup>
        ) : (
          <LayerGroup>
            {characterPins
              ?.filter(PinFilter)
              ?.map((pin) => (
                <MapPin key={pin.id} isReadOnly={isReadOnly} isViewOnly={isViewOnly} map_id={item_id as string} pinData={pin} />
              ))}
          </LayerGroup>
        )}
      </LayersControl.Overlay>
      {/* Markers layer */}
      <LayersControl.Overlay checked name="Map pins">
        {isClusteringPins ? (
          <MarkerClusterGroup chunkedLoading removeOutsideVisibleBounds showCoverageOnHover>
            {nonCharacterPins
              ?.filter(PinFilter)
              ?.map((pin) => (
                <MapPin key={pin.id} isReadOnly={isReadOnly} isViewOnly={isViewOnly} map_id={item_id as string} pinData={pin} />
              ))}
          </MarkerClusterGroup>
        ) : (
          <LayerGroup>
            {nonCharacterPins
              ?.filter(PinFilter)
              ?.map((pin) => (
                <MapPin key={pin.id} isReadOnly={isReadOnly} isViewOnly={isViewOnly} map_id={item_id as string} pinData={pin} />
              ))}
          </LayerGroup>
        )}
      </LayersControl.Overlay>

      <LayerGroup>
        {mapData?.map_layers?.length
          ? mapData.map_layers
              .filter((layer) => layer.image_id && (isReadOnly ? layer.is_public : true))
              .map((layer) => {
                return (
                  <LayersControl.Overlay key={layer.id + layer.title} name={layer.title}>
                    <ImageOverlay
                      bounds={bounds as LatLngBoundsExpression}
                      className="leafletImageOverlayLayer"
                      url={src}
                      zIndex={9999}
                    />
                  </LayersControl.Overlay>
                );
              })
          : null}
      </LayerGroup>
    </LayersControl>
  );
}
