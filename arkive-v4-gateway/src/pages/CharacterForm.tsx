import groupBy from "lodash.groupby";
import { ReactNode, useLayoutEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AvatarUpload, Editor, Input, Skeleton } from "../../../components";
import { useGetEntities, useGetEntity, useHandleChange } from "../../../hooks";
import { CharacterFieldTemplateType, CharacterType, HandleChangePropsType } from "../../../types";

const baseCharacterSections = [{ id: "name", title: "Basic info" }];

type SectionType = Partial<CharacterType> & { handleChange: (props: HandleChangePropsType) => void };

function SectionLayout({ children }: { children: ReactNode | ReactNode[] }) {
  return <section className="grid grid-cols-4 gap-2"> {children} </section>;
}

function NameSection({ first_name, last_name, nickname, age, project_id, biography, portrait_id, handleChange }: SectionType) {
  const { entity_id } = useParams();
  return (
    <SectionLayout>
      <div className="flex items-end gap-x-2">
        <div className="w-12 max-w-12">
          <AvatarUpload image_id={portrait_id} project_id={project_id as string} id={entity_id as string} />
        </div>
        <Input
          value={first_name}
          name="first_name"
          onChange={handleChange}
          label="First name (required)"
          variant={first_name ? "primary" : "error"}
        />
      </div>
      <Input value={nickname || ""} name="nickname" onChange={handleChange} label="Nickname" />
      <Input value={last_name || ""} name="last_name" onChange={handleChange} label="Last name" />
      <Input type="number" value={age || ""} name="age" onChange={handleChange} label="Age" />
      <div className="col-span-4 flex h-[30rem] flex-col">
        <span className="text-sm text-zinc-300">Biography</span>
        <Editor initialContent={biography || undefined} isFullHeight name="biography" onChange={handleChange} />
      </div>
    </SectionLayout>
  );
}

export function CharacterForm() {
  const { type, access_id, entity_id, section_id } = useParams();
  const [sections, setSections] = useState(baseCharacterSections);
  const [character, setCharacter] = useState<Partial<CharacterType>>({ first_name: "", last_name: "" });
  const { handleChange } = useHandleChange({ data: character, setData: setCharacter });

  const { data: existingCharacter, isFetching: isFetchingCharacter } = useGetEntity<CharacterType>(
    entity_id,
    type as "characters",
    {
      fields: ["id", "project_id", "first_name", "portrait_id", "last_name", "biography", "age"],
      relations: {
        character_fields: true,
        tags: true,
      },
    }
  );
  const { data: templates, isFetching: isFetchingTemplates } = useGetEntities<CharacterFieldTemplateType>(
    {
      data: { project_id: existingCharacter?.data?.project_id },
      fields: ["id", "title", "sort"],
      relations: {
        character_fields_sections: true,
        character_fields: true,
      },
      relationFilters: {
        or: (character?.tags || [])?.map((t) => ({
          operator: "in",
          value: t.id,
          id: t.id,
          header_name: "tags",
          relationalData: { blueprint_field_id: "tags" },
          field: "tags",
        })),
      },
      orderBy: [
        {
          field: "sort",
          sort: "desc",
        },
      ],
    },
    "character_fields_templates",
    {
      enabled: !!existingCharacter?.data?.project_id && !!character?.tags?.length,
      staleTime: 5 * 60 * 1000,
    }
  );

  useLayoutEffect(() => {
    if (existingCharacter?.data) {
      setCharacter(existingCharacter?.data);
    }
  }, [existingCharacter]);
  useLayoutEffect(() => {
    let additionalSections: { id: string; title: string }[] = [];
    if (templates?.data) {
      const temp = (templates?.data || []).map((template) => ({
        sections: template.character_fields_sections,
        grouped_fields: groupBy(template.character_fields, "section_id"),
      }));

      additionalSections = temp.flatMap((template) => template.sections);
    }
    setSections(baseCharacterSections.concat(additionalSections));
  }, [templates]);

  if (isFetchingCharacter || isFetchingTemplates) return <Skeleton type="character_profile" />;

  return (
    <>
      <div className="col-span-2 overflow-hidden rounded-l-md bg-zinc-800">
        <h3 className="py-2 text-center font-merriweather text-xl font-bold">Sections</h3>
        <ul className="h-full overflow-y-auto">
          {sections.map((section) => (
            <li
              className={`border-b border-zinc-700 text-lg first:border-t ${section_id === section.id ? "bg-zinc-700" : ""}`}
              key={section.id}>
              <Link to={`/${type}/${access_id}/${entity_id}/${section.id}`} className="block h-full w-full px-4 py-2">
                {section.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="col-span-10 overflow-hidden rounded-r-md bg-zinc-900 p-4">
        {section_id === "name" ? (
          <NameSection
            first_name={character.first_name}
            portrait_id={character.portrait_id}
            project_id={character.project_id}
            last_name={character.last_name}
            biography={character.biography}
            age={character.age}
            handleChange={handleChange}
          />
        ) : null}
      </div>
    </>
  );
}
