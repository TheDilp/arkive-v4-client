import { useParams } from "react-router-dom";

import { DocumentMention, GraphMention, MapMention } from ".";

type Props = {
  node: any;
};

export function MentionReactComponent({ node }: Props) {
  const { project_id } = useParams();

  if (node?.attrs) {
    const { id, name, label, alterId } = node.attrs;

    if (name === "documents")
      return <DocumentMention alterId={alterId} id={id} label={label} project_id={project_id} title={label} />;
    if (name === "maps") return <MapMention nodeId={id} nodeLabel={label} project_id={project_id} />;
    if (name === "boards" || name === "graphs") return <GraphMention nodeId={id} nodeLabel={label} project_id={project_id} />;
    // if (name === "words") return <WordMention id={id} label={label} title={label} />;

    return <span>{label}</span>;
  }
  return <span />;
}
