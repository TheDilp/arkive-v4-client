import { useState } from "react";

import { useHandleChange } from "../../../hooks";
import { GameType } from "../../../types";
import { ImageSelect } from "../../Complex";
import { EntityPreview } from "../../DataDisplay";
import { Input, Search } from "../../Form";
import { DrawerLayout } from "../../Layout";

// type Props = {
//   data: {
//     id?: string;
//   };
// };

export default function GameDrawer() {
  const [project, setProject] = useState({ id: "", title: "" });
  const [game, setGame] = useState<Partial<GameType>>({});
  const { handleChange } = useHandleChange({ data: game, setData: setGame });
  return (
    <DrawerLayout>
      {game?.project_id ? (
        <EntityPreview
          clearAction={() => {
            setProject({ id: "", title: "" });
            handleChange({ name: "project_id", value: null });
          }}
          id={game?.project_id}
          title={project.title}
          type="projects"
        />
      ) : (
        <Search
          label="Linked project (required)"
          manual_project_id={game?.project_id}
          name="project_id"
          onChange={({ name, label, value }) => {
            setProject({ id: value, title: label as string });
            handleChange({ name, value });
          }}
          searchEntity="projects"
          variant={game?.project_id ? "primary" : "error"}
        />
      )}
      <Input
        isDisabled={!game?.project_id}
        label="Title (required)"
        name="title"
        onChange={handleChange}
        value={game?.title}
        variant={game?.title ? "primary" : "error"}
      />
      <ImageSelect
        isDisabled={!game?.project_id}
        isIgnoringPermissions
        label="Cover image (optional)"
        manual_project_id={game?.project_id}
        name="background_image"
        onChange={handleChange}
        type="images"
        value={game.background_image || ""}
      />
    </DrawerLayout>
  );
}
