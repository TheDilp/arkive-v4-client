import { useSetAtom } from "jotai";
import { ReactNode, useEffect, useLayoutEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Button, Input, RelatedEntityForm, Skeleton } from "../../../components";
import {
  useCreateSubEntity,
  useGetEntity,
  useGetGatewayOptions,
  useGetSubEntity,
  useHandleChange,
  useUpdateSubEntity,
} from "../../../hooks";
import { BlueprintFieldType, BlueprintInstanceType, BlueprintType, HandleChangePropsType } from "../../../types";
import { CreateConfigType } from "../../../types/EntityTypes/gatewayTypes";
import { dialogAtom, getDifferenceForAdditionalFields, getSavingIcon, getSavingTooltip, IconEnum } from "../../../utils";
import { InsertBlueprintInstanceSchema, UpdateBlueprintInstanceSchema } from "../../../validation";

const baseCharacterSections = [{ id: "title", title: "Basic info" }];

type SectionType = Partial<BlueprintInstanceType> &
  Pick<BlueprintType, "project_id"> & { handleChange: (props: HandleChangePropsType) => void };

function SectionLayout({ children }: { children: ReactNode | ReactNode[] }) {
  return <section className="grid grid-cols-1 gap-x-2 gap-y-4"> {children} </section>;
}

function TitleSection({ title, create_config, handleChange }: SectionType & { create_config: CreateConfigType | undefined }) {
  return (
    <SectionLayout>
      <Input
        isDisabled={create_config?.is_locked}
        label="Title (required)"
        name="title"
        onChange={handleChange}
        value={title}
        variant={title ? "primary" : "error"}
      />
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

function getInitialCreateData(create_config: CreateConfigType | undefined, project_id: string) {
  if (!create_config || !("title" in create_config)) return { blueprint_fields: [] };
  return { title: create_config.title, parent_id: create_config.parent_id, project_id, blueprint_fields: [] };
}

export function BlueprintInstanceForm() {
  const { type, access_id, entity_id, section_id } = useParams();
  const [sections, setSections] = useState(baseCharacterSections);
  const [fields, setFields] = useState<Record<string, BlueprintFieldType[]>>({ other: [] });
  const setDialog = useSetAtom(dialogAtom);
  const { data } = useGetGatewayOptions(
    { data: { entity_type: type as "blueprint_instances", access_id: access_id as string } },
    "blueprint_instances"
  );
  const [blueprintInstance, setBlueprintInstance] = useState<Partial<BlueprintInstanceType>>(
    data?.data?.create_config
      ? getInitialCreateData(data?.data?.create_config, data?.data?.project_id)
      : {
          parent_id: data?.data?.create_config?.parent_id,
          blueprint_fields: [],
        }
  );
  const { handleChange, changedData, resetChanges } = useHandleChange({
    data: blueprintInstance,
    setData: setBlueprintInstance,
  });
  const config_tags = (data?.data?.entities || []).filter((item) => item.entity_type === "tags");

  const navigate = useNavigate();

  const {
    data: existingBlueprintInstance,
    isInitialLoading,
    isFetching,
  } = useGetSubEntity<BlueprintInstanceType>(
    entity_id,
    type as "blueprint_instances",
    {
      fields: ["id", "title", "parent_id"],
      relations: {
        blueprint_fields: true,
        tags: true,
      },
    },
    {
      enabled: !!entity_id,
    }
  );

  const { data: blueprint } = useGetEntity<BlueprintType>(
    existingBlueprintInstance?.data?.parent_id || data?.data?.create_config?.parent_id,
    "blueprints",
    {
      data: { id: existingBlueprintInstance?.data?.parent_id || data?.data?.create_config?.parent_id },
      fields: ["id"],
      relations: { blueprint_fields: true },
    },
    {
      enabled: !!blueprintInstance?.parent_id || !!data?.data?.create_config?.parent_id,
    }
  );

  const { mutate: create, isLoading: isCreating } = useCreateSubEntity("blueprint_instances", data?.data?.project_id);
  const { mutate: update, isLoading: isUpdating } = useUpdateSubEntity(
    "blueprint_instances",
    data?.data?.project_id,
    existingBlueprintInstance?.data?.parent_id
  );

  useLayoutEffect(() => {
    if (existingBlueprintInstance?.data) {
      setBlueprintInstance(existingBlueprintInstance?.data);
    } else {
      setBlueprintInstance(
        data?.data?.create_config ? getInitialCreateData(data?.data?.create_config, data?.data?.project_id) : { title: "" }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingBlueprintInstance, data?.data?.create_config]);
  useLayoutEffect(() => {
    let hasOtherFields = false;
    const additionalSections: { id: string; title: string }[] = (blueprint?.data?.blueprint_fields || [])?.map((f) => ({
      id: f.id,
      title: f.title,
    }));

    const tempFields: Record<string, BlueprintFieldType[]> = {};

    const finalSections = baseCharacterSections.concat(additionalSections);
    if (hasOtherFields) finalSections.push({ id: "other", title: "Other" });

    if (blueprint?.data?.blueprint_fields?.length) {
      (blueprint?.data?.blueprint_fields || []).forEach((field) => {
        tempFields[field.id] = [field];
      });
    }

    setSections(finalSections);
    setFields(tempFields);
  }, [blueprint?.data]);

  useEffect(() => {
    if (blueprintInstance?.title && !!entity_id) {
      save(false);
      resetChanges();
    }
  }, [section_id]);

  if (isInitialLoading && isFetching)
    return (
      <div className="col-span-12">
        <Skeleton type="character_profile" />
      </div>
    );

  function save(isComplete: boolean) {
    if (isComplete && changedData)
      setDialog((prev) => ({
        ...prev,
        isOverlay: true,
        title: `Complete ${entity_id ? "editing" : "creating"} ${type === "characters" ? "character" : "blueprint instance"}?`,
        description: `Once complete, access to this gateway will be revoked. Are you sure you want to finish ${entity_id ? "editing" : "creating"} this ${type === "characters" ? "character" : "blueprint instance"}?`,
        confirm: {
          action: () => {
            if (existingBlueprintInstance?.data) {
              const dataToParse = {
                data: blueprintInstance,
                permissions: blueprintInstance?.permissions,
                relations: {
                  character_fields: getDifferenceForAdditionalFields(
                    existingBlueprintInstance?.data?.blueprint_fields || [],
                    blueprintInstance?.blueprint_fields || []
                  ),
                },
              };

              const parsedData = UpdateBlueprintInstanceSchema.parse(dataToParse);
              // @ts-expect-error inserting a new key
              parsedData.data.project_id = blueprint?.data?.project_id || data?.data?.project_id;
              update(parsedData, {
                onSuccess: () => {
                  document.location = "https://thearkive.app";
                },
              });
            } else {
              const dataToParse = {
                data: blueprintInstance,
                permissions: blueprintInstance?.permissions,
                relations: {
                  tags: config_tags.map((t) => ({ id: t.value })),
                  blueprint_fields: blueprintInstance?.blueprint_fields || [],
                },
              };

              const parsedData = InsertBlueprintInstanceSchema.parse(dataToParse);
              // @ts-expect-error inserting a new key
              parsedData.data.project_id = blueprint?.data?.project_id || data?.data?.project_id;
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
          {blueprintInstance?.title}
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
      <div className="col-span-10 flex h-full flex-col overflow-hidden rounded-r-md bg-zinc-900 p-4">
        {(sections || []).map((section) => {
          if (section.id !== section_id) return null;

          return (
            <div key={section.id}>
              {section.id === "title" ? (
                <TitleSection
                  create_config={data?.data?.create_config}
                  handleChange={handleChange}
                  project_id={data?.data?.project_id || ""}
                  title={blueprintInstance?.title || ""}
                />
              ) : null}
              {section.id !== "title" && !!fields?.[section.id]?.length ? (
                <RelatedEntityForm
                  fields={fields?.[section.id] || []}
                  fields_data={blueprintInstance?.blueprint_fields || []}
                  handleChange={handleChange}
                  hasCreateOrEdit={true}
                  isDrawer={false}
                  options={data?.data?.entities || null}
                  type="blueprint_instances"
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
                  `/${type}/${access_id}/${entity_id ? `update/${entity_id}` : "create"}/${sections[getPreviousSection(sections, section_id as string)]?.id}`
                );
              }}
              variant="info"
            />
            <Button
              icon={entity_id ? IconEnum.check_circle : IconEnum.add}
              isDisabled={!blueprintInstance?.title || isCreating || isUpdating}
              isLoading={isCreating || isUpdating}
              label={entity_id ? "Complete" : "Create"}
              onClick={() => save(true)}
              variant="success"
            />
            <Button
              icon={IconEnum.chevron_right}
              isDisabled={sections?.at(-1)?.id === section_id || isCreating || isUpdating}
              label="Next section"
              onClick={() => {
                navigate(
                  `/${type}/${access_id}/${entity_id ? `update/${entity_id}` : "create"}/${sections[geNextSection(sections, section_id as string)]?.id}`
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
