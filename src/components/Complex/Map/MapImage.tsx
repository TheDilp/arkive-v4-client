import { useSetAtom } from "jotai";
import { LatLngBoundsExpression } from "leaflet";
import { useEffect, useRef, useState } from "react";
import { ImageOverlay, LayerGroup, LayersControl, useMapEvents } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { useParams } from "react-router-dom";

import { MapPinType, MapType } from "../../../types";
import { contextMenuAtom, drawerAtom, getImageURL, IconEnum } from "../../../utils";
import { MapPin } from "./MapPin";

type Props = {
  mapData: MapType;
  src: string;
  bounds: LatLngBoundsExpression;
  imgRef: any;
  isReadOnly?: boolean;
  isClusteringPins: boolean;
};

export function MapImage({ mapData, src, bounds, imgRef, isReadOnly, isClusteringPins }: Props) {
  const firstRender = useRef(true);
  const { project_id, item_id, subitem_id } = useParams();
  const [markerFilter, setMarkerFilter] = useState<"map" | "doc" | false>(false);
  const setContextMenu = useSetAtom(contextMenuAtom);

  function PinFilter(mapPin: MapPinType) {
    if (isReadOnly) {
      if (mapPin.is_public) {
        if (markerFilter === "map") {
          return false;
        }
        if (markerFilter === "doc") {
          return Boolean(mapPin.doc_id);
        }
        return true;
      }
      return false;
    }
    if (markerFilter === "map") {
      return Boolean(mapPin.map_link);
    }
    if (markerFilter === "doc") {
      return Boolean(mapPin.doc_id);
    }
    return true;
  }
  function handleKeyUp(e: KeyboardEvent) {
    if (!e.shiftKey && !e.altKey) {
      setMarkerFilter(false);
    }
  }
  function handleKeyDown(e: KeyboardEvent) {
    if (e.shiftKey && e.altKey) {
      setMarkerFilter(false);
      return;
    }
    if (e.shiftKey) {
      setMarkerFilter("map");
    } else if (e.altKey) {
      setMarkerFilter("doc");
    }
  }
  const setDrawer = useSetAtom(drawerAtom);

  const map = useMapEvents({
    contextmenu(e: any) {
      if (!isReadOnly) {
        setContextMenu({
          event: e.originalEvent,
          items: [
            {
              icon: IconEnum.map_pin,
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
            // {
            //   icon: IconEnum.character,
            //   title: "Manage characters",
            //   onClick: () => {
            //     setDrawer((prev) => ({
            //       ...prev,
            //       data: { lat: e.latlng.lat, lng: e.latlng.lng, map_id: item_id as string },
            //       title: "Manage characters",
            //       type: "map_character_placement",
            //     }));
            //   },
            // },
          ],
        });
        // setDrawer((prev) => ({ ...prev, data: { ...e.latlng } }));
      }
    },
  });
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (subitem_id && mapData && firstRender.current) {
      const pin = mapData?.map_pins?.find((map_pin) => map_pin.id === subitem_id);
      if (pin) map.panTo([pin.lat, pin.lng], {});
    } else if (bounds && firstRender.current) {
      map.fitBounds(bounds);
    }
    return () => {
      firstRender.current = false;
    };
  }, [subitem_id, bounds]);
  if (!map) return null;

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
    },
  );

  return (
    <LayersControl position="topright">
      <LayersControl.BaseLayer checked name="Map">
        <ImageOverlay ref={imgRef} bounds={bounds} url={src} />
      </LayersControl.BaseLayer>

      {/* Markers layer */}
      <LayersControl.Overlay checked name="Markers">
        {isClusteringPins ? (
          <MarkerClusterGroup chunkedLoading removeOutsideVisibleBounds showCoverageOnHover>
            {nonCharacterPins?.filter(PinFilter).map((pin) => (
              <MapPin key={pin.id} map_id={item_id as string} pinData={pin} readOnly={isReadOnly} />
            ))}
          </MarkerClusterGroup>
        ) : (
          <LayerGroup>
            {nonCharacterPins?.filter(PinFilter).map((pin) => (
              <MapPin key={pin.id} map_id={item_id as string} pinData={pin} readOnly={isReadOnly} />
            ))}
          </LayerGroup>
        )}
      </LayersControl.Overlay>
      {/* Characters layer */}
      <LayersControl.Overlay checked name="Characters">
        {isClusteringPins ? (
          <MarkerClusterGroup chunkedLoading removeOutsideVisibleBounds showCoverageOnHover>
            {characterPins.map((pin) => (
              <MapPin key={pin.id} map_id={item_id as string} pinData={pin} readOnly={isReadOnly} />
            ))}
          </MarkerClusterGroup>
        ) : (
          <LayerGroup>
            {characterPins?.map((pin) => (
              <MapPin key={pin.id} map_id={item_id as string} pinData={pin} readOnly={isReadOnly} />
            ))}
          </LayerGroup>
        )}
      </LayersControl.Overlay>
      <LayerGroup>
        {mapData?.map_layers?.length
          ? mapData.map_layers
              .sort((a, b) => {
                if (a.title > b.title) return 1;
                if (a.title < b.title) return -1;
                return 0;
              })
              .filter((layer) => layer.image_id && (isReadOnly ? layer.is_public : true))
              .map((layer) => {
                return (
                  <LayersControl.Overlay key={layer.id + layer.title} name={layer.title}>
                    <ImageOverlay
                      bounds={bounds}
                      className="leafletImageOverlayLayer"
                      url={getImageURL(project_id as string, "maps", layer.image_id)}
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
