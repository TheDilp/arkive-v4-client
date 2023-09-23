import { useParams } from "react-router-dom";

import { Tags } from "../Entities";

export function SettingsView() {
  const { type } = useParams();
  if (type === "tags") return <Tags />;
  return null;
}
