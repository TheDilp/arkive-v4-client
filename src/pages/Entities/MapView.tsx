import { CRS, LatLngBoundsExpression } from "leaflet";
import { useEffect, useRef, useState } from "react";
import { MapContainer } from "react-leaflet";
import { useParams } from "react-router-dom";

import { MapImage, Select } from "../../components";
import { useChangeNavbarTitle, useGetEntity } from "../../hooks";
import { MapPinFilterType, MapType, onChangeValue } from "../../types";
import { getImageURL } from "../../utils";

type Props = {
  data?: MapType;
  isReadOnly?: boolean;
  isViewOnly?: boolean;
  center_on?: string;
};

export function MapView({ data, isReadOnly, isViewOnly, center_on }: Props) {
  const { project_id, item_id } = useParams();
  const [bounds, setBounds] = useState<number[][] | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapPinFilters, setMapPinFilters] = useState<MapPinFilterType[]>(["all"]);
  const mapRef = useRef() as any;
  const imgRef = useRef() as any;

  const { data: existingMap, isFetching } = useGetEntity<MapType>(
    item_id as string,
    "maps",
    {
      data: {},
      relations: { map_pins: true, map_layers: true },
    },
    {
      enabled: !data && !!item_id,
    },
  );
  const currentMap = data || existingMap?.data;
  useChangeNavbarTitle(`Maps | ${currentMap?.title || ""}`, !!currentMap?.title);

  function changeMapPinFilters({ value }: { value: onChangeValue["value"] }) {
    if (Array.isArray(value)) {
      if (value.includes("all") && !mapPinFilters.includes("all")) setMapPinFilters(["all"]);
      else if (mapPinFilters.includes("all")) setMapPinFilters(value.filter((v) => v !== "all") as MapPinFilterType[]);
      else setMapPinFilters(value as MapPinFilterType[]);
    }
  }

  useEffect(() => {
    if (currentMap && currentMap?.image_id && !bounds) {
      setLoading(true);

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
        }
        setLoading(false);
      };
    }
  }, [currentMap, project_id]);

  if (!currentMap) return null;
  return (
    <div className="relative z-[2] flex h-full w-full flex-col overflow-hidden">
      <link href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" rel="stylesheet" />
      <div className="w-full">
        <div className="relative mb-3 ml-auto w-52">
          <Select
            isMultiple
            name="mapPinFilter"
            onChange={changeMapPinFilters}
            options={[
              { label: "All map pins", value: "all" },
              { label: "Have documents", value: "documents" },
              { label: "Have linked maps", value: "linked_maps" },
            ]}
            placeholder="Filter"
            value={mapPinFilters}
          />
        </div>
      </div>
      {loading || isFetching ? <div className="h-full w-full animate-pulse bg-zinc-900" /> : null}
      {currentMap && !isFetching && !loading && !!bounds ? (
        <div className="h-full w-full overflow-hidden">
          <MapContainer
            ref={mapRef}
            attributionControl={false}
            bounds={bounds as LatLngBoundsExpression}
            center={[bounds[1][0] / 2, bounds[1][1] / 2]}
            className="h-full w-full flex-1 outline-none"
            crs={CRS.Simple}
            maxZoom={2}
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
