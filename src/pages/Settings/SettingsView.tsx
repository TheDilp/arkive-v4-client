import { useParams } from "react-router-dom";

import { AssetView, Tags } from "../Entities";

export function SettingsView() {
  const { type } = useParams();
  if (type === "tags") return <Tags />;
  if (type === "assets") return <AssetView />;
  return null;
}
