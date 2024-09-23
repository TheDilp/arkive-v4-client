import { WikiProjectCard } from "../../components";
import { useGetInfiniteEntities } from "../../hooks";
import { ProjectType } from "../../types";

export function Home() {
  const { data: cardData } = useGetInfiniteEntities<ProjectType>(
    {
      data: {
        project_id: "all",
      },
      fields: ["id", "title", "description", "image_id"],
      pagination: {
        limit: 12,
      },
    },
    "projects",
    {
      enabled: true,
      keepPreviousData: true,
      getNextPageParam: (_, allPages) => {
        if (allPages[allPages.length - 1]?.data?.length < 10) return undefined;
        return allPages.length;
      },
    }
  );

  return (
    <div className="flex h-screen max-h-screen w-screen flex-col p-4">
      <div className="grid max-h-full grid-cols-4 gap-4 overflow-y-auto">
        {(cardData?.pages || [])?.map((page) =>
          page.data.map((project) => (
            <WikiProjectCard
              key={project.id}
              description={project.description}
              id={project.id}
              image_id={project.image_id}
              owner={project.owner}
              title={project.title}
            />
          ))
        )}
      </div>
    </div>
  );
}
