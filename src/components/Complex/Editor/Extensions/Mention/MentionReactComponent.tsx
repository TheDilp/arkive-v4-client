import { useParams } from "react-router-dom";

import { DocumentMention, EventMention, GraphMention, MapMention, WordMention } from ".";
import { BlueprintMention } from "./BlueprintMention";
import { CharacterMention } from "./CharacterMention";

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
      parentId: parent_id,
    } = node.attrs as {
      id: string;
      name: string;
      label: string;
      alterId?: string;
      icon?: string;
      parentId?: string;
    };
    if (name === "characters") return <CharacterMention nodeId={id} nodeLabel={label} project_id={project_id} />;
    if (name === "documents")
      return <DocumentMention alterId={alterId} id={id} label={label} project_id={project_id} title={label} />;
    if (name === "maps") return <MapMention nodeId={id} nodeLabel={label} project_id={project_id} />;
    if (name === "graphs") return <GraphMention nodeId={id} nodeLabel={label} project_id={project_id} />;
    if (name === "blueprint_instances")
      return (
        <BlueprintMention
          icon={icon}
          nodeId={id}
          nodeLabel={label}
          parent_id={parent_id}
          project_id={project_id}
          title={label}
        />
      );
    if (name === "words") return <WordMention id={id} label={label} title={label} />;
    if (name === "events")
      return <EventMention nodeId={id} nodeLabel={label} parent_id={parent_id} project_id={project_id} title={label} />;

    return <span>{label}</span>;
  }
  return <span />;
}
