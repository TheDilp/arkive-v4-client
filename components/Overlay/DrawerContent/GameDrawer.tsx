import { useState } from "react";

import { useHandleChange } from "../../../hooks";
import { GameType } from "../../../types";
import { IconEnum } from "../../../utils";
import { ImageSelect } from "../../Complex";
import { EntityPreview } from "../../DataDisplay";
import { Button, Input, Search } from "../../Form";
import { DrawerLayout } from "../../Layout";

type Props = {
  data: {
    id?: string;
  };
};

export function GameDrawer({ data }: Props) {
  const [project, setProject] = useState({ id: "", title: "" });
  const [game, setGame] = useState<Partial<GameType>>({});
  const { handleChange } = useHandleChange({ data: game, setData: setGame });

  // const { mutate } = useCreateEntity<{ data: Partial<GameType> }>("games");
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
      <Input
        label="Next session date (optional)"
        name="next_session_date"
        onChange={handleChange}
        type="datetime-local"
        value={game?.next_session_date}
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
      <div>
        <Button
          icon={data?.id ? IconEnum.save : IconEnum.add}
          isDisabled={!game?.project_id || !game?.title}
          label={data?.id ? "Save" : "Create"}
          // onClick={() => mutate({ data: game })}
          onClick={undefined}
          variant="success"
        />
      </div>
    </DrawerLayout>
  );
}
