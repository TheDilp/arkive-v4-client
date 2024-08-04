import { useParams } from "react-router-dom";

import { DocumentMention, EventMention, GraphMention, MapMention, WordMention } from ".";
import { BlueprintMention } from "./BlueprintMention";
import { CharacterMention } from "./CharacterMention";
import { MapPinMention } from "./MapPinMention";
import { SearchableMentionEntities } from "../../../../../types";

type Props = {
  node: any;
};

export function MentionReactComponent({ node }: Props) {
  const { project_id } = useParams();

  if (node?.attrs) {
    const {
      id,
      name,
      label,
      alterId,
      icon,
      projectId,
      type,
      parentId: parent_id,
    } = node.attrs as {
      id: string;
      name: string;
      label: string;
      alterId: string | null;
      icon?: string;
      parentId?: string;
      projectId?: string;
      type: SearchableMentionEntities;
    };

    if (name === "characters") return <CharacterMention id={id} label={label} project_id={projectId || project_id} />;
    if (name === "documents")
      return <DocumentMention alterId={alterId} id={id} label={label} project_id={projectId || project_id} title={label} />;
    if (name === "maps") return <MapMention id={id} label={label} project_id={projectId || project_id} />;
    if (name === "map_pins")
      return <MapPinMention id={id} label={label} parent_id={parent_id} project_id={projectId || project_id} />;
    if (name === "graphs") return <GraphMention id={id} label={label} project_id={projectId || project_id} />;
    if (name === "blueprint_instances")
      return (
        <BlueprintMention
          icon={icon}
          id={id}
          label={label}
          parent_id={parent_id}
          project_id={projectId || project_id}
          title={label}
        />
      );
    if (name === "words") return <WordMention id={id} label={label} title={label} />;
    if (name === "events")
      return <EventMention id={id} label={label} parent_id={parent_id} project_id={projectId || project_id} title={label} />;

    return <span>{label}</span>;
  }
  return <span />;
}
