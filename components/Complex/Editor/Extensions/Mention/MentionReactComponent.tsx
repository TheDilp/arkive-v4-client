import { useParams } from "react-router-dom";

import { SearchableMentionEntities } from "../../../../../types";
import { Mention } from "./Mention";

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
      icon,
      projectId,
      alterName: alter_name,
      parentId: parent_id,
    } = node.attrs as {
      id: string;
      name: SearchableMentionEntities;
      label: string;
      alterName: string | null;
      icon?: string;
      parentId?: string | null;
      projectId?: string | null;
    };
    return (
      <Mention
        alter_name={alter_name}
        icon={icon}
        id={id}
        label={label}
        parent_id={parent_id}
        project_id={projectId || project_id}
        type={name}
      />
    );
  }
  return <span />;
}
