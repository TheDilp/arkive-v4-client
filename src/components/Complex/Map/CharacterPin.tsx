import L from "leaflet";
import ReactDOM from "react-dom/server";
import { Marker, Tooltip } from "react-leaflet";
import { useParams } from "react-router-dom";

import { CharacterType } from "../../../types";
import { getCharacterFullName, getImageURL } from "../../../utils";

export function CharacterPin({
  pinData,
  readOnly,
}: {
  pinData: Pick<CharacterType, "id" | "first_name" | "last_name" | "portrait_id">;
  readOnly?: boolean;
}) {
  const { project_id } = useParams();
  const { portrait_id, first_name, last_name } = pinData;
  return (
    <Marker
      draggable={!readOnly}
      //   eventHandlers={eventHandlers}
      icon={L.divIcon({
        className: "relative",
        html: ReactDOM.renderToString(
          <div className="relative">
            <div className="absolute">
              <div
                className="fixed h-full w-full rounded-full"
                style={{
                  background: portrait_id ? getImageURL(project_id as string, "images", portrait_id) : "",
                  backgroundImage: portrait_id ? `url(${getImageURL(project_id as string, "images", portrait_id)})` : "",
                  backgroundColor: "#000000",
                  backgroundPosition: "center",
                  backgroundSize: portrait_id ? "contain" : "2rem",
                  backgroundRepeat: "no-repeat",
                  border: "#ffffff solid 1px",
                  zIndex: 999999,
                }}
              />
            </div>
          </div>,
        ),
        iconAnchor: [16, 22],
        iconSize: [24, 24],
        tooltipAnchor: [-4, -20],
      })}
      position={[4300, 4700]}>
      {first_name ? (
        <Tooltip direction="top">
          <div className="Lato text-center text-xs">{getCharacterFullName(first_name, undefined, last_name)}</div>
        </Tooltip>
      ) : null}
    </Marker>
  );
}
