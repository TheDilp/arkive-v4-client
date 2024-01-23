import { CRS, LatLngBoundsExpression } from "leaflet";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { MapContainer } from "react-leaflet";
import { useParams } from "react-router-dom";

import { MapImage, Select } from "../../components";
import { useChangeNavbarTitle, useGetEntities, useGetEntity } from "../../hooks";
import { MapPinTypesType, MapType, onChangeValue } from "../../types";
import { getImageURL } from "../../utils";

type Props = {
  data?: MapType;
  isReadOnly?: boolean;
  isViewOnly?: boolean;
  isPublic?: boolean;
  center_on?: string;
};

export function MapView({ data, isReadOnly, isViewOnly, isPublic, center_on }: Props) {
  const { project_id, item_id, subitem_id } = useParams();
  const [bounds, setBounds] = useState<number[][] | null>(null);
  const { data: existingMapPinTypes, isInitialLoading: isInitialLoadingTypes } = useGetEntities<MapPinTypesType>(
    { data: { project_id }, fields: ["id", "title", "default_icon", "default_icon_color"] },
    "map_pin_types",
    {
      enabled: !isPublic,
    },
  );
  const mapPinTypes = (existingMapPinTypes?.data || []).map((type) => ({ label: type.title, value: type.id }));
  const [mapPinFilters, setMapPinFilters] = useState<string[]>(["all"]);
  const firstRender = useRef(true) as MutableRefObject<boolean>;
  const mapRef = useRef() as any;
  const imgRef = useRef() as any;
  const { data: existingMap, isFetching } = useGetEntity<MapType>(
    item_id as string,
    "maps",
    {
      data: {},
      fields: ["id", "image_id", "icon", "cluster_pins"],
      relations: { map_pins: true, map_layers: true },
    },
    {
      enabled: !data && !!item_id,
      isPublic,
    },
  );
  const currentMap = data || existingMap?.data;
  useChangeNavbarTitle(`Maps | ${currentMap?.title || ""}`, !!currentMap?.title);

  function changeMapPinFilters({ value }: { value: onChangeValue["value"] }) {
    if (Array.isArray(value)) {
      if (value.length === 0) setMapPinFilters(["all"]);
      else if (value.includes("all") && !mapPinFilters.includes("all")) setMapPinFilters(["all"]);
      else if (mapPinFilters.includes("all")) setMapPinFilters(value.filter((v) => v !== "all"));
      else setMapPinFilters(value);
    }
  }

  useEffect(() => {
    if (currentMap && currentMap?.image_id && !bounds) {
      // setLoading(true);

      const img = new Image();
      img.src = getImageURL(project_id as string, "map_images", currentMap?.image_id);
      img.onload = () => {
        setBounds([
          [0, 0],
          [img.height, img.width],
        ]);
        if (imgRef.current) {
          imgRef.current.setBounds([
            [0, 0],
            [img.height, img.width],
          ]);
          imgRef.current.panTo([0, 0]);
          imgRef.current.leafletElement.fitBounds(bounds);
        }
      };
      setTimeout(() => {
        firstRender.current = false;
      }, 200);
    }
  }, [currentMap, project_id]);

  if (!currentMap) return null;
  return (
    <div className="relative z-[2] flex h-full w-full flex-col overflow-hidden">
      <link href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" rel="stylesheet" />
      {isPublic || isViewOnly ? null : (
        <div className="w-full">
          <div className="relative mb-3 ml-auto w-52">
            <Select
              hasSearch
              isDisabled={isInitialLoadingTypes}
              isLoading={isInitialLoadingTypes}
              isMultiple
              name="mapPinFilter"
              onChange={changeMapPinFilters}
              options={[
                { label: "All map pins", value: "all" },
                { label: "With documents", value: "documents" },
                { label: "With linked maps", value: "linked_maps" },
              ].concat(mapPinTypes)}
              placeholder="Filter"
              value={mapPinFilters}
            />
          </div>
        </div>
      )}
      {isFetching ? <div className="h-full w-full animate-pulse bg-zinc-900" /> : null}
      {currentMap && !isFetching && !!bounds ? (
        <div className="min-h-full min-w-full">
          <MapContainer
            ref={(node) => {
              mapRef.current = node;
              if (bounds && firstRender.current) {
                if (!center_on && !subitem_id) node?.fitBounds(bounds as LatLngBoundsExpression);
                if (center_on) {
                  const pin = currentMap?.map_pins?.find((map_pin) =>
                    center_on ? map_pin.id === center_on : map_pin.id === subitem_id,
                  );
                  if (pin) node?.panTo([pin.lat, pin.lng], {});
                }
              }
            }}
            attributionControl={false}
            bounds={bounds as LatLngBoundsExpression}
            center={[bounds[1][0] / 2, bounds[1][1] / 2]}
            className="h-full w-full flex-1 outline-none"
            crs={CRS.Simple}
            maxZoom={5}
            minZoom={-3}
            scrollWheelZoom
            zoom={1}
            zoomSnap={0}>
            <MapImage
              bounds={bounds as LatLngBoundsExpression}
              center_on={center_on}
              imgRef={imgRef}
              isClusteringPins={!!currentMap?.cluster_pins}
              isReadOnly={isReadOnly}
              isViewOnly={isViewOnly}
              mapData={currentMap}
              mapPinFilters={mapPinFilters}
              src={getImageURL(project_id as string, "map_images", currentMap?.image_id)}
            />
          </MapContainer>
        </div>
      ) : null}
    </div>
  );
}
