import { WikiProjectCard } from "../../components";
import { useGetEntities } from "../../hooks";
import { ProjectType } from "../../types";

export function Home() {
  const { data } = useGetEntities<ProjectType>({ fields: [] }, "projects");

  return (
    <div className="flex h-screen max-h-screen w-screen flex-col p-4">
      <div className="grid grid-cols-4 gap-4">
        {(data?.data || []).map((project) => (
          <WikiProjectCard
            key={project.id}
            id={project.id}
            image_id={project.image_id}
            owner={project.owner}
            title={project.title}
          />
        ))}
      </div>
    </div>
  );
}
