import { useSetAtom } from "jotai";
import { ReactNode, useEffect, useLayoutEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Avatar, AvatarUpload, Button, Editor, Input, RelatedEntityForm, Skeleton } from "../../../components";
import {
  useCreateEntity,
  useGetEntities,
  useGetEntity,
  useGetGatewayOptions,
  useHandleChange,
  useUpdateEntity,
} from "../../../hooks";
import { CharacterFieldTemplateType, CharacterFieldType, CharacterType, HandleChangePropsType } from "../../../types";
import { CreateConfigType, GatewayEntityType } from "../../../types/EntityTypes/gatewayTypes";
import {
  dialogAtom,
  getCharacterFullName,
  getDifferenceForCharacterFields,
  getSavingIcon,
  getSavingTooltip,
  IconEnum,
} from "../../../utils";
import { InsertCharacterSchema, UpdateCharacterSchema } from "../../../validation";

const baseCharacterSections = [{ id: "name", title: "Basic info" }];

type SectionType = Partial<CharacterType> & { handleChange: (props: HandleChangePropsType) => void };

function SectionLayout({ children }: { children: ReactNode | ReactNode[] }) {
  return <section className="grid grid-cols-4 gap-x-2 gap-y-4"> {children} </section>;
}

function NameSection({
  first_name,
  last_name,
  nickname,
  age,
  project_id,
  biography,
  portrait_id,
  create_config,
  handleChange,
}: SectionType & { create_config: CreateConfigType | undefined }) {
  const { entity_id } = useParams();
  return (
    <SectionLayout>
      <div className="flex items-end gap-x-2">
        <div className="w-12 max-w-12">
          <AvatarUpload id={entity_id as string} image_id={portrait_id} project_id={project_id as string} />
        </div>
        <Input
          isDisabled={create_config?.is_locked}
          label="First name (required)"
          name="first_name"
          onChange={handleChange}
          value={first_name}
          variant={first_name ? "primary" : "error"}
        />
      </div>
      <Input label="Nickname" name="nickname" onChange={handleChange} value={nickname || ""} />
      <Input
        isDisabled={create_config?.is_locked}
        label="Last name"
        name="last_name"
        onChange={handleChange}
        value={last_name || ""}
      />
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

function getInitialCreateData(create_config: CreateConfigType | undefined, entity_type: GatewayEntityType, project_id: string) {
  if (!create_config) return {};
  if (create_config.is_locked) {
    if ("first_name" in create_config)
      return { first_name: create_config.first_name, last_name: create_config.last_name, project_id };
    else return { title: create_config.title, project_id };
  } else {
    if (entity_type === "characters")
      return {
        first_name: create_config.first_name || "",
        last_name: create_config.last_name || "",
        project_id,
      };
    return {
      title: create_config.title || "",
      project_id,
    };
  }
}

export function CharacterForm() {
  const { type, access_id, entity_id, section_id } = useParams();
  const [sections, setSections] = useState(baseCharacterSections);
  const [fields, setFields] = useState<Record<string, CharacterFieldType[]>>({ other: [] });
  const setDialog = useSetAtom(dialogAtom);
  const { data } = useGetGatewayOptions(
    { data: { entity_type: type as "characters", access_id: access_id as string } },
    "characters"
  );
  const [character, setCharacter] = useState<Partial<CharacterType>>(
    data?.data?.create_config
      ? getInitialCreateData(data?.data?.create_config, type as GatewayEntityType, data?.data?.project_id)
      : {}
  );
  const { handleChange, changedData, resetChanges } = useHandleChange({ data: character, setData: setCharacter });

  const config_tags = (data?.data?.entities || []).filter((item) => item.entity_type === "tags");

  const navigate = useNavigate();
  const {
    data: existingCharacter,
    isInitialLoading,
    isFetching,
  } = useGetEntity<CharacterType>(
    entity_id,
    type as "characters",
    {
      fields: ["id", "project_id", "first_name", "nickname", "last_name", "portrait_id", "biography", "age"],
      relations: {
        character_fields: true,
        tags: true,
      },
    },
    {
      enabled: !!entity_id,
    }
  );
  const { data: templates, isFetching: isFetchingTemplates } = useGetEntities<CharacterFieldTemplateType>(
    {
      data: { project_id: data?.data?.project_id },
      fields: ["id", "title", "sort"],
      relations: {
        character_fields_sections: true,
        character_fields: true,
      },
      relationFilters: {
        or: config_tags.length
          ? config_tags.map((tag) => ({
              operator: "in",
              value: tag.value,
              id: tag.value,
              header_name: "tags",
              relationalData: { blueprint_field_id: "tags" },
              field: "tags",
            }))
          : (character?.tags || [])?.map((t) => ({
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
      enabled:
        ((!!existingCharacter?.data?.project_id && !!character?.tags?.length) || !!config_tags.length) &&
        !!data?.data?.project_id,
      staleTime: 5 * 60 * 1000,
    }
  );

  const { mutate: create, isLoading: isCreating } = useCreateEntity("characters", undefined, {
    successNotification: false,
  });
  const { mutate: update, isLoading: isUpdating } = useUpdateEntity("characters", existingCharacter?.data?.project_id, {
    successNotification: false,
  });

  useLayoutEffect(() => {
    if (existingCharacter?.data) {
      setCharacter(existingCharacter?.data);
    } else {
      setCharacter(
        data?.data?.create_config
          ? getInitialCreateData(data?.data?.create_config, type as GatewayEntityType, data?.data?.project_id)
          : { project_id: data?.data?.project_id }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingCharacter, data?.data?.create_config]);
  useLayoutEffect(() => {
    let hasOtherFields = false;
    const additionalSections: { id: string; title: string }[] = [];
    const tempFields: Record<string, CharacterFieldType[]> = { other: [] };
    if (templates?.data) {
      (templates?.data || []).forEach((template) => {
        additionalSections.push(...template.character_fields_sections);

        template.character_fields.forEach((field) => {
          if (field.section_id === null) {
            hasOtherFields = true;
            if (tempFields["other"]) tempFields["other"].push(field);
            else {
              tempFields["other"] = [];
              tempFields["other"].push(field);
            }
          } else {
            if (tempFields?.[field.section_id]) tempFields[field.section_id].push(field);
            else tempFields[field.section_id] = [field];
          }
        });
      });
    }
    const finalSections = baseCharacterSections.concat(
      additionalSections.filter((section) => tempFields?.[section.id] && !!tempFields[section.id].length)
    );
    if (hasOtherFields) finalSections.push({ id: "other", title: "Other" });

    setSections(finalSections);
    setFields(tempFields);
  }, [templates]);

  useEffect(() => {
    if (character?.first_name && !!entity_id) {
      save();
      resetChanges();
    }
  }, [section_id]);

  if ((isInitialLoading && isFetching) || isFetchingTemplates)
    return (
      <div className="col-span-12">
        <Skeleton type="character_profile" />
      </div>
    );

  function save() {
    setDialog((prev) => ({
      ...prev,
      isOverlay: true,
      title: `Complete ${entity_id ? "editing" : "creating"} ${type === "characters" ? "character" : "blueprint instance"}?`,
      description: `Once complete, access to this gateway will be revoked. Are you sure you want to finish ${entity_id ? "editing" : "creating"} this ${type === "characters" ? "character" : "blueprint instance"}?`,
      confirm: {
        action: () => {
          if (existingCharacter?.data) {
            const dataToParse = {
              data: character,
              permissions: character?.permissions,
              relations: {
                character_fields: getDifferenceForCharacterFields(
                  existingCharacter?.data,
                  character || { character_fields: [] }
                ),
              },
            };
            if (dataToParse?.data?.portrait?.id) {
              dataToParse.data.portrait_id = dataToParse.data.portrait.id;
            }
            const parsedData = UpdateCharacterSchema.parse(dataToParse);
            update(parsedData, {
              onSuccess: () => {
                document.location = "https://thearkive.app";
              },
            });
          } else {
            const dataToParse = {
              data: character,
              permissions: character?.permissions,
              relations: {
                tags: config_tags.map((t) => ({ id: t.value })),
                character_fields: character?.character_fields || [],
              },
            };
            if (dataToParse?.data?.portrait?.id) {
              dataToParse.data.portrait_id = dataToParse.data.portrait.id;
            }
            const parsedData = InsertCharacterSchema.parse(dataToParse);
            create(parsedData, {
              onSuccess: () => {
                document.location = "https://thearkive.app";
              },
            });
          }
        },
        label: "Complete",
        variant: "success",
        icon: IconEnum.check_circle,
      },
      cancel: { action: () => {}, label: "Cancel" },
    }));
  }
  return (
    <>
      <div
        className="col-span-12 pb-2 text-4xl font-bold"
        style={{
          gridRow: "1 / 2",
        }}>
        <h1 className="flex items-center gap-x-4">
          {character?.portrait_id ? <Avatar image_id={character?.portrait_id} /> : null}
          {getCharacterFullName(character?.first_name || "", null, character?.last_name)}
          {entity_id ? (
            <div className="ml-auto">
              <Button
                hasNoBackground
                icon={getSavingIcon(isUpdating, changedData)}
                iconSize={48}
                isIconOnly
                isLoading={changedData && isUpdating}
                onClick={undefined}
                tooltip={getSavingTooltip(isUpdating, changedData)}
                variant={changedData ? "warning" : "success"}
              />
            </div>
          ) : null}
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
              key={section.id}
              className={`border-b border-zinc-700 text-lg transition-all first:border-t ${section_id === section.id ? "bg-zinc-700" : ""}`}>
              <Link
                className="block h-full w-full px-4 py-2"
                to={`/${type}/${access_id}/${entity_id || "create"}/${section.id}`}>
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
            <div key={section.id} className="">
              {section.id === "name" ? (
                <NameSection
                  age={character?.age || undefined}
                  biography={character?.biography || undefined}
                  create_config={data?.data?.create_config}
                  first_name={character?.first_name || ""}
                  handleChange={handleChange}
                  last_name={character?.last_name || ""}
                  nickname={character?.nickname || ""}
                  portrait_id={character?.portrait_id || ""}
                  project_id={character?.project_id || ""}
                />
              ) : null}

              {section.id === "other" && !!fields?.["other"]?.length ? (
                <RelatedEntityForm
                  fields={fields?.["other"] || []}
                  fields_data={character?.character_fields || []}
                  handleChange={handleChange}
                  hasCreateOrEdit={true}
                  isDrawer={false}
                  options={data?.data?.entities || null}
                />
              ) : null}

              {section.id !== "name" && section.id !== "other" && !!fields?.[section.id]?.length ? (
                <RelatedEntityForm
                  fields={fields?.[section.id] || []}
                  fields_data={character?.character_fields || []}
                  handleChange={handleChange}
                  hasCreateOrEdit={true}
                  isDrawer={false}
                  options={data?.data?.entities || null}
                />
              ) : null}
            </div>
          );
        })}
        <div className="mt-auto flex flex-col gap-y-2">
          <div className="flex flex-nowrap content-end gap-x-2">
            <Button
              icon={IconEnum.chevron_left}
              iconPos="left"
              isDisabled={sections[0].id === section_id || isCreating || isUpdating}
              label="Previous section"
              onClick={() => {
                navigate(
                  `/${type}/${access_id}/${entity_id || "create"}/${sections[getPreviousSection(sections, section_id as string)]?.id}`
                );
              }}
              variant="info"
            />
            <Button
              icon={entity_id ? IconEnum.check_circle : IconEnum.add}
              isDisabled={!character?.first_name || isCreating || isUpdating}
              isLoading={isCreating || isUpdating}
              label={entity_id ? "Complete" : "Create"}
              onClick={save}
              variant="success"
            />
            <Button
              icon={IconEnum.chevron_right}
              isDisabled={sections?.at(-1)?.id === section_id || isCreating || isUpdating}
              label="Next section"
              onClick={() => {
                navigate(
                  `/${type}/${access_id}/${entity_id || "create"}/${sections[geNextSection(sections, section_id as string)]?.id}`
                );
              }}
              variant="info"
            />
          </div>
        </div>
      </div>
    </>
  );
}
