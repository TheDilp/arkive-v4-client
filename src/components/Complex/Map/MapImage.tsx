import { useSetAtom } from "jotai";
import { LatLngBoundsExpression } from "leaflet";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { ImageOverlay, LayerGroup, LayersControl, useMapEvents } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { useParams } from "react-router-dom";

import { useGetEntity } from "../../../hooks";
import { MapPinType, MapType } from "../../../types";
import { drawerAtom, getImageURL } from "../../../utils";
import { MapPin } from "./MapPin";

type Props = {
  cm: MutableRefObject<any>;
  src: string;
  bounds: LatLngBoundsExpression;
  imgRef: any;
  isReadOnly?: boolean;
  isClusteringPins: boolean;
};

export function MapImage({ src, bounds, imgRef, cm, isReadOnly, isClusteringPins }: Props) {
  const firstRender = useRef(true);
  const { project_id, item_id, subitem_id } = useParams();
  const { data: currentMap } = useGetEntity<MapType>(item_id as string, "maps", { data: {} });
  const [markerFilter, setMarkerFilter] = useState<"map" | "doc" | false>(false);

  const PinFilter = (mapPin: MapPinType) => {
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
  };
  const handleKeyUp = (e: KeyboardEvent) => {
    if (!e.shiftKey && !e.altKey) {
      setMarkerFilter(false);
    }
  };
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.shiftKey && e.altKey) {
      setMarkerFilter(false);
      return;
    }
    if (e.shiftKey) {
      setMarkerFilter("map");
    } else if (e.altKey) {
      setMarkerFilter("doc");
    }
  };
  const setDrawer = useSetAtom(drawerAtom);
  // eslint-disable-next-line no-unused-vars
  const map = useMapEvents({
    contextmenu(e: any) {
      if (!isReadOnly) {
        // setMapContext({ type: "map" });
        cm.current.show(e.originalEvent);
        setDrawer((prev) => ({ ...prev, data: { ...e.latlng } }));
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
    if (subitem_id && currentMap) {
      const pin = currentMap?.data?.map_pins.find((map_pin) => map_pin.id === subitem_id);
      if (pin) map.panTo([pin.lat, pin.lng], {});
    } else if (firstRender.current) map.fitBounds(bounds);
    return () => {
      firstRender.current = false;
    };
  }, [subitem_id, bounds]);
  if (!map) return null;
  return (
    <div>
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="Map">
          <ImageOverlay ref={imgRef} bounds={bounds} url={src} />
        </LayersControl.BaseLayer>

        {/* Markers layer */}
        <LayersControl.Overlay checked name="Markers">
          {isClusteringPins ? (
            <MarkerClusterGroup chunkedLoading removeOutsideVisibleBounds showCoverageOnHover>
              {currentMap?.data?.map_pins &&
                currentMap?.data?.map_pins
                  ?.filter(PinFilter)
                  .map((pin) => <MapPin key={pin.id} cm={cm} map_id={item_id as string} pinData={pin} readOnly={isReadOnly} />)}
            </MarkerClusterGroup>
          ) : (
            <LayerGroup>
              {currentMap?.data?.map_pins &&
                currentMap?.data?.map_pins
                  ?.filter(PinFilter)
                  .map((pin) => <MapPin key={pin.id} cm={cm} map_id={item_id as string} pinData={pin} readOnly={isReadOnly} />)}
            </LayerGroup>
          )}
        </LayersControl.Overlay>
        <LayerGroup>
          {currentMap?.data?.map_layers?.length
            ? currentMap?.data.map_layers
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
    </div>
  );
}
