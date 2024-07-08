import React, { useState } from "react";

import { useHandleChange } from "../../../hooks";
import { Input } from "../../Form";
import { DrawerLayout } from "../../Layout";

type Props = {
  data: {
    id?: string;
    preselectedTab?: number;
  };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ManuscriptDrawer({ data }: Props) {
  const [manuscript, setManuscript] = useState({ title: "" });
  const { handleChange } = useHandleChange({ data: manuscript, setData: setManuscript });

  return (
    <DrawerLayout>
      <Input
        label="Title (required)"
        name="title"
        onChange={handleChange}
        placeholder="Title"
        value={manuscript.title}
        variant={!manuscript.title ? "error" : "primary"}
      />
    </DrawerLayout>
  );
}
