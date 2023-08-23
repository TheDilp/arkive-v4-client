import { CRS, LatLngBoundsExpression } from "leaflet";
import { useEffect, useRef, useState } from "react";
import { MapContainer } from "react-leaflet";
import { useParams } from "react-router-dom";

import { MapImage } from "../../components";
import { useChangeNavbarTitle, useDeleteSubEntity, useGetEntity } from "../../hooks";
import { MapType } from "../../types";
import { getImageURL } from "../../utils";

type Props = {
  isReadOnly?: boolean;
};

export function MapView({ isReadOnly }: Props) {
  const { project_id, item_id } = useParams();
  const { mutate: deleteMapPin } = useDeleteSubEntity("map_pins");
  const [bounds, setBounds] = useState<number[][]>([
    [0, 0],
    [0, 0],
  ]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef() as any;
  const imgRef = useRef() as any;
  const cm = useRef() as any;

  const { data: currentMap, isLoading } = useGetEntity<MapType>(item_id as string, "maps", {
    data: {},
    relations: { map_pins: true },
  });
  useChangeNavbarTitle(`The Arkive | Maps | ${currentMap?.data?.title || ""}`, !!currentMap?.data?.title);

  useEffect(() => {
    if (currentMap?.data && currentMap?.data?.image_id) {
      setLoading(true);
      const img = new Image();
      img.src = getImageURL(project_id as string, "maps", currentMap?.data?.image_id);
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
  }, [currentMap?.data, project_id]);

  // if (loading || isLoading) return <ProgressSpinner />;
  if (!currentMap) return null;
  return (
    <div className="relative z-[2] flex h-full w-full flex-col overflow-hidden">
      <link href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" rel="stylesheet" />
      {loading || isLoading ? <div className="h-full w-full animate-pulse bg-zinc-900" /> : null}
      {currentMap?.data && !isLoading && !loading ? (
        <div className="h-full w-full">
          <MapContainer
            ref={mapRef}
            attributionControl={false}
            bounds={bounds as LatLngBoundsExpression}
            center={[bounds[1][0] / 2, bounds[1][1] / 2]}
            className="h-full w-full flex-1 bg-zinc-900 outline-none"
            crs={CRS.Simple}
            maxZoom={2}
            minZoom={-3}
            scrollWheelZoom
            zoom={1}
            zoomSnap={0}>
            <MapImage
              bounds={bounds as LatLngBoundsExpression}
              cm={cm}
              imgRef={imgRef}
              isClusteringPins={!!currentMap?.data?.cluster_pins}
              isReadOnly={isReadOnly}
              mapData={currentMap?.data}
              src={getImageURL(project_id as string, "maps", currentMap?.data?.image_id)}
            />
          </MapContainer>
        </div>
      ) : null}
    </div>
  );
}
