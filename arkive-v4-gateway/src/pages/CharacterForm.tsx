import { ReactNode, useEffect, useLayoutEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Avatar, AvatarUpload, Button, Editor, FieldTemplateRows, Input, Skeleton } from "../../../components";
import { useGetEntities, useGetEntity, useGetGatewayOptions, useHandleChange, useUpdateEntity } from "../../../hooks";
import { CharacterFieldTemplateType, CharacterFieldType, CharacterType, HandleChangePropsType } from "../../../types";
import { getCharacterFullName, getDifferenceForCharacterFields, getImageURL, IconEnum } from "../../../utils";
import { UpdateCharacterSchema } from "../../../validation";

const baseCharacterSections = [{ id: "name", title: "Basic info" }];

type SectionType = Partial<CharacterType> & { handleChange: (props: HandleChangePropsType) => void };

function SectionLayout({ children }: { children: ReactNode | ReactNode[] }) {
  return <section className="grid grid-cols-4 gap-x-2 gap-y-4"> {children} </section>;
}

function NameSection({ first_name, last_name, nickname, age, project_id, biography, portrait_id, handleChange }: SectionType) {
  const { entity_id } = useParams();
  return (
    <SectionLayout>
      <div className="flex items-end gap-x-2">
        <div className="w-12 max-w-12">
          <AvatarUpload id={entity_id as string} image_id={portrait_id} project_id={project_id as string} />
        </div>
        <Input
          label="First name (required)"
          name="first_name"
          onChange={handleChange}
          value={first_name}
          variant={first_name ? "primary" : "error"}
        />
      </div>
      <Input label="Nickname" name="nickname" onChange={handleChange} value={nickname || ""} />
      <Input label="Last name" name="last_name" onChange={handleChange} value={last_name || ""} />
      <Input label="Age" name="age" onChange={handleChange} type="number" value={age || ""} />
      <div className="col-span-4 flex h-[30rem] flex-col">
        <span className="text-sm text-zinc-300">Biography</span>
        <Editor initialContent={biography || undefined} isFullHeight name="biography" onChange={handleChange} />
      </div>
    </SectionLayout>
  );
}

function getPreviousSection(sections: { id: string; title: string }[], section_id: string) {
  const idx = sections.findIndex((s) => s.id === section_id);

  if (idx > 0) return idx - 1;

  return idx;
}
function geNextSection(sections: { id: string; title: string }[], section_id: string) {
  const idx = sections.findIndex((s) => s.id === section_id);

  if (idx < sections.length - 1) return idx + 1;

  return idx;
}

export function CharacterForm() {
  const { type, access_id, entity_id, section_id } = useParams();
  const [sections, setSections] = useState(baseCharacterSections);
  const [fields, setFields] = useState<Record<string, CharacterFieldType[]>>({ other: [] });
  const [character, setCharacter] = useState<Partial<CharacterType>>();
  const { handleChange } = useHandleChange({ data: character, setData: setCharacter });
  const navigate = useNavigate();
  const { data: existingCharacter, isInitialLoading } = useGetEntity<CharacterType>(entity_id, type as "characters", {
    fields: ["id", "project_id", "first_name", "nickname", "last_name", "portrait_id", "biography", "age"],
    relations: {
      character_fields: true,
      tags: true,
    },
  });
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
          sort: "asc",
        },
      ],
    },
    "character_fields_templates",
    {
      enabled: !!existingCharacter?.data?.project_id && !!character?.tags?.length,
      staleTime: 5 * 60 * 1000,
    }
  );

  const { mutate: update } = useUpdateEntity("characters", existingCharacter?.data?.project_id, {
    successNotification: false,
  });

  const { data } = useGetGatewayOptions(
    { data: { entity_type: type as "characters", access_id: access_id as string } },
    "characters"
  );
  useLayoutEffect(() => {
    if (existingCharacter?.data) {
      setCharacter(existingCharacter?.data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingCharacter]);
  useLayoutEffect(() => {
    const additionalSections: { id: string; title: string }[] = [];
    const tempFields: Record<string, CharacterFieldType[]> = { other: [] };
    if (templates?.data) {
      (templates?.data || []).forEach((template) => {
        additionalSections.push(...template.character_fields_sections);
        template.character_fields.forEach((field) => {
          if (!field.section_id) tempFields["other"].push(field);
          else {
            if (tempFields?.[field.section_id]) tempFields[field.section_id].push(field);
            else tempFields[field.section_id] = [field];
          }
        });
      });
    }
    setSections(
      baseCharacterSections
        .concat(additionalSections.filter((section) => tempFields?.[section.id] && !!tempFields[section.id].length))
        .concat({ id: "other", title: "Other" })
    );
    setFields(tempFields);
  }, [templates]);

  useEffect(() => {
    if (character?.first_name) save();
  }, [section_id]);

  if (isInitialLoading || isFetchingTemplates)
    return (
      <div className="col-span-12">
        <Skeleton type="character_profile" />
      </div>
    );

  function save() {
    if (existingCharacter?.data) {
      const dataToParse = {
        data: character,
        permissions: character?.permissions,
        relations: {
          character_fields: getDifferenceForCharacterFields(existingCharacter?.data, character || { character_fields: [] }),
        },
      };
      if (dataToParse?.data?.portrait?.id) {
        dataToParse.data.portrait_id = dataToParse.data.portrait.id;
      }
      const parsedData = UpdateCharacterSchema.parse(dataToParse);
      update(parsedData);
    }
  }

  return (
    <>
      <div
        className="col-span-12 pb-2 text-4xl font-bold"
        style={{
          gridRow: "1 / 2",
        }}>
        <h1 className="flex items-center gap-x-4">
          {character?.portrait_id ? (
            <Avatar image={getImageURL(character.project_id as string, "images", character?.portrait_id)} />
          ) : null}
          {getCharacterFullName(character?.first_name || "", null, character?.last_name)}
        </h1>
      </div>
      <div
        className="col-span-1 overflow-hidden rounded-l-md bg-zinc-800 lg:col-span-2"
        style={{
          gridRow: "span 1",
        }}>
        <h3 className="py-2 text-center font-merriweather text-xl font-bold">Sections</h3>
        <ul className="h-full overflow-y-auto">
          {sections.map((section) => (
            <li
              className={`border-b border-zinc-700 text-lg transition-all first:border-t ${section_id === section.id ? "bg-zinc-700" : ""}`}
              key={section.id}>
              <Link className="block h-full w-full px-4 py-2" to={`/${type}/${access_id}/${entity_id}/${section.id}`}>
                {section.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div
        className="col-span-10 flex h-full flex-col overflow-hidden rounded-r-md bg-zinc-900 p-4"
        style={{
          gridRow: "span 1",
        }}>
        {(sections || []).map((section) => {
          if (section.id !== section_id) return null;

          return (
            <div className="" key={section.id}>
              {section.id === "name" ? (
                <NameSection
                  age={character?.age || undefined}
                  biography={character?.biography || undefined}
                  first_name={character?.first_name || ""}
                  handleChange={handleChange}
                  last_name={character?.last_name || ""}
                  nickname={character?.nickname || ""}
                  portrait_id={character?.portrait_id || ""}
                  project_id={character?.project_id || ""}
                />
              ) : null}

              {section.id === "other" && !!fields?.["other"]?.length ? (
                <FieldTemplateRows
                  character_fields={fields?.["other"] || []}
                  character_fields_data={character?.character_fields || []}
                  handleChange={handleChange}
                  hasCreateOrEdit={true}
                  isDrawer={false}
                  options={data?.data || null}
                />
              ) : null}

              {section.id !== "name" && section.id !== "other" && !!fields?.[section.id]?.length ? (
                <FieldTemplateRows
                  character_fields={fields?.[section.id] || []}
                  character_fields_data={character?.character_fields || []}
                  handleChange={handleChange}
                  hasCreateOrEdit={true}
                  isDrawer={false}
                  options={data?.data || null}
                />
              ) : null}
            </div>
          );
        })}
        <div className="mt-auto flex flex-col gap-y-2">
          {section_id === "other" ? (
            <div>
              <Button
                icon={IconEnum.check_circle}
                isDisabled={!character?.first_name}
                label="Complete"
                onClick={save}
                variant="success"
              />
            </div>
          ) : null}
          <div className="flex flex-nowrap content-end gap-x-2">
            <Button
              icon={IconEnum.chevron_left}
              iconPos="left"
              isDisabled={sections[0].id === section_id}
              label="Previous section"
              onClick={() => {
                navigate(
                  `/${type}/${access_id}/${entity_id}/${sections[getPreviousSection(sections, section_id as string)]?.id}`
                );
              }}
              variant="info"
            />
            <Button
              icon={IconEnum.chevron_right}
              isDisabled={sections?.at(-1)?.id === section_id}
              label="Next section"
              onClick={() => {
                navigate(`/${type}/${access_id}/${entity_id}/${sections[geNextSection(sections, section_id as string)]?.id}`);
              }}
              variant="info"
            />
          </div>
        </div>
      </div>
    </>
  );
}
