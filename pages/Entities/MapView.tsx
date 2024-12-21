import { useSetAtom } from "jotai";
import { CRS, LatLngBoundsExpression } from "leaflet";
import { useEffect, useRef, useState } from "react";
import { MapContainer } from "react-leaflet";
import { useParams } from "react-router-dom";

import { MapImage, Select } from "../../components";
import { useGetEntities, useGetEntity, useHasPermissions, useNavbarTitle } from "../../hooks";
import { useImageURL } from "../../hooks/ui/useImageURL";
import { MapPinTypesType, MapType, onChangeValue } from "../../types";
import { getAssetURL, hasEntityUpdatePermissionForEntityView } from "../../utils";

type Props = {
  data?: MapType;
  isReadOnly?: boolean;
  isViewOnly?: boolean;
  center_on?: string;
};

export function MapView({ data, isReadOnly, isViewOnly, center_on }: Props) {
  const { project_id, item_id, subitem_id } = useParams();
  const [bounds, setBounds] = useState<number[][] | null>(null);
  const { data: existingMapPinTypes, isInitialLoading: isInitialLoadingTypes } = useGetEntities<MapPinTypesType>(
    { data: { project_id }, fields: ["id", "title", "default_icon", "default_icon_color"] },
    "map_pin_types",
    { enabled: !IS_PUBLIC && !IS_GATEWAY }
  );
  const setEntityUpdatePermission = useSetAtom(hasEntityUpdatePermissionForEntityView);

  const mapPinTypes = (existingMapPinTypes?.data || []).map((type) => ({ label: type.title, value: type.id }));
  const [mapPinFilters, setMapPinFilters] = useState<string[]>(["all"]);
  const imgRef = useRef() as any;
  const {
    data: existingMap,
    isFetching,
    isLoading,
  } = useGetEntity<MapType>(
    item_id as string,
    "maps",
    {
      data: {},
      fields: ["id", "title", "owner_id", "image_id", "icon", "cluster_pins", "owner_id"],
      relations: { map_pins: true, map_layers: true },
      permissions: true,
    },
    {
      enabled: !data && !!item_id,
    }
  );

  const [currentMap, setCurrentMap] = useState<MapType | null>();

  useEffect(() => {
    setCurrentMap(data || existingMap?.data);
  }, [data, existingMap?.data, isFetching]);

  const permissions = useHasPermissions(
    ["read_maps", "update_maps", "create_map_pins", "read_map_pins", "update_map_pins", "delete_map_pins"],
    currentMap?.owner_id
  );

  useNavbarTitle(`Maps | ${currentMap?.title || ""}`, !!currentMap?.title && !isViewOnly);

  function changeMapPinFilters({ value }: { value: onChangeValue["value"] }) {
    if (Array.isArray(value)) {
      if (value.length === 0) setMapPinFilters(["all"]);
      else if (value.includes("all") && !mapPinFilters.includes("all")) setMapPinFilters(["all"]);
      else if (mapPinFilters.includes("all")) setMapPinFilters(value.filter((v) => v !== "all"));
      else setMapPinFilters(value);
    }
  }
  const url = useImageURL(getAssetURL(project_id as string, "map_images", currentMap?.image_id));
  const pin =
    center_on || subitem_id
      ? currentMap?.map_pins?.find((map_pin) => (center_on ? map_pin.id === center_on : map_pin.id === subitem_id))
      : null;
  useEffect(() => {
    if (currentMap && currentMap?.image_id && !bounds && url) {
      setEntityUpdatePermission(currentMap?.permissions?.some((p) => p.code === "update_maps") || false);
      const img = new Image();
      img.src = url;
      img.onload = () => {
        setBounds([
          [0, 0],
          [img.height, img.width],
        ]);
      };
    }
  }, [currentMap, project_id, url, imgRef.current]);

  if (!currentMap) return null;
  return (
    <div className="relative z-[2] flex h-full w-full flex-col overflow-hidden">
      <link href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" rel="stylesheet" />
      {IS_PUBLIC || isViewOnly ? null : (
        <div className="relative z-10 w-full">
          <div className="relative z-10 mb-3 ml-auto w-52">
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
      {isLoading && !currentMap ? <div className="h-full w-full animate-pulse bg-zinc-900" /> : null}
      {currentMap && (!isLoading || (data && isLoading)) && !!bounds && (IS_PUBLIC || permissions?.read_maps) ? (
        <div className="z-0 min-h-full min-w-full">
          <MapContainer
            attributionControl={false}
            bounds={bounds as LatLngBoundsExpression}
            center={pin ? [pin.lat, pin.lng] : [bounds[1][0] / 2, bounds[1][1] / 2]}
            className="h-full w-full flex-1 outline-none"
            crs={CRS.Simple}
            maxZoom={5}
            minZoom={-3}
            scrollWheelZoom
            zoom={pin ? 1 : undefined}
            zoomSnap={0}>
            <MapImage
              bounds={bounds}
              center_on={center_on}
              imgRef={imgRef}
              isClusteringPins={!!currentMap?.cluster_pins}
              isReadOnly={isReadOnly}
              isViewOnly={isViewOnly}
              mapData={currentMap}
              mapPinFilters={mapPinFilters}
              permissions={permissions}
              src={url}
            />
          </MapContainer>
        </div>
      ) : null}
    </div>
  );
}
