import React from "react";
import { PublicEntityLayout } from "./PublicLayout";
import { useGetEntity } from "../../../hooks";
import { ManuscriptType } from "../../../types/EntityTypes/manuscriptTypes";
import { useParams } from "react-router-dom";
import { ManuscriptProfileView } from "../../../pages";

type Props = {};

export default function PublicManuscript({}: Props) {
  const { item_id } = useParams();
  const {
    data: manuscript,
    error,
    isInitialLoading,
    // isLoading,
    // isFetching,
  } = useGetEntity<ManuscriptType>(
    item_id,
    "manuscripts",
    {
      relations: {
        entities: true,
      },
      fields: ["id", "title", "is_public", "icon"],
    },
    {
      staleTime: 60 * 1000,
    }
  );

  return (
    <PublicEntityLayout title={manuscript?.data?.title || ""}>
      <div className="h-[calc(100%-6rem)] px-5">
        <ManuscriptProfileView />
      </div>
    </PublicEntityLayout>
  );
}
