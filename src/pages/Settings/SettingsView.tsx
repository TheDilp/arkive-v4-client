import { useParams } from "react-router-dom";
import { FieldTemplates } from "./FieldTemplates";
import { Tags } from "./Tags";

type Props = {};

export function SettingsView({}: Props) {
  const { type } = useParams();
  return (
    <>
      {type === "field-templates" ? <FieldTemplates /> : null}
      {type === "tags" ? <Tags /> : null}
    </>
  );
}
