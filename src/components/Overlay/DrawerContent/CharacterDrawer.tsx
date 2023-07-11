import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useCreateEntity, useGetAllEntities, useGetImages, useGetItem, useHandleChange, useUpdateEntity } from "../../../hooks";
import { CharacterType, FieldTemplate, FieldType, SelectOptionType } from "../../../types";
import { getImageURL, IconEnum } from "../../../utils";
import { ImageSelect } from "../../Complex/ImageSelect";
import { Button, Checkbox, Input, Select, Textarea } from "../../Form";
import { Tabs } from "../../Layout/Tabs";

type insertCharacterType = Partial<CharacterType> & { project_id: string };

function CharacterFieldInputs({
  id,
  title,
  fieldType,
  options,
  value: currentValue,
  parentId,
  handleChange,
}: FieldType & {
  value: string | string[] | undefined;
  handleChange: ({ name, value }: { name: string; value: any }) => void;
}) {
  const name = `${parentId}.${id}`;
  if (fieldType === "text" || fieldType === "number") {
    return <Input label={title} name={name} onChange={handleChange} value={currentValue as string} />;
  }
  if (fieldType === "select" || fieldType === "select_multiple") {
    return (
      <Select
        isMultiple={fieldType === "select_multiple"}
        label={title}
        name={name}
        onChange={handleChange}
        options={options?.map((opt) => ({ label: opt, value: opt })) || []}
        value={currentValue}
      />
    );
  }
  if (fieldType === "textarea") {
    return (
      <div className="h-[10rem] max-h-full min-h-[10rem]">
        <Textarea label={title} name={name} onChange={handleChange} value={currentValue as string} />
      </div>
    );
  }
  return null;
}

export function CharacterDrawer({ data, resetDrawerAtom }: { data: { id?: string }; resetDrawerAtom: () => void }) {
  const { project_id } = useParams();
  const [selectedTab, setSelectedTab] = useState(0);

  const { data: existingCharacter } = useGetItem<
    CharacterType & { characterFieldTemplates: { [key: string]: { [key: string]: string } } }
  >(data?.id, "characters", {
    enabled: !!data?.id,
  });

  const [character, setCharacter] = useState<Partial<CharacterType> & { project_id: string }>(
    existingCharacter?.data || { project_id: project_id as string },
  );

  const [fields, setFields] = useState<{ [key: string]: { [key: string]: string } }>(
    existingCharacter?.data?.characterFieldTemplates || {},
  );

  const { mutateAsync: create } = useCreateEntity<{
    data: insertCharacterType;
    relations?: { characterFieldTemplates?: { [key: string]: { [key: string]: string } }; image?: { id: string | null } };
  }>("characters");

  const { mutateAsync: update } = useUpdateEntity<{
    data: insertCharacterType & { id: string };
    relations?: { characterFieldTemplates?: { [key: string]: { [key: string]: string } } };
  }>("characters", project_id as string, data?.id);

  const { data: images = [], isFetching: isFetchingImages } = useGetImages(project_id as string, "images", {
    select: (res): SelectOptionType[] => {
      if (res?.data && res?.data?.length) {
        return res.data.map((img) => ({
          label: img.title,
          value: img.id,
          image: {
            link: getImageURL(project_id as string, "images", img.id),
          },
        }));
      }
      return [];
    },
  });
  const { data: templates } = useGetAllEntities<FieldTemplate>(
    { data: { project_id: project_id as string }, relations: { characterFields: true } },
    "character_fields_templates",
    {
      enabled: selectedTab === 1,
    },
  );
  const { handleChange } = useHandleChange({ data: character, setData: setCharacter });
  const { handleChange: handleChangeFields } = useHandleChange({ data: fields, setData: setFields });

  useEffect(() => {
    if (existingCharacter?.data) {
      const { characterFieldTemplates, ...char } = existingCharacter.data;
      setCharacter(char);
      setFields(characterFieldTemplates || {});
    }
  }, [existingCharacter?.data]);

  return (
    <>
      <Tabs
        onChange={(_, index) => setSelectedTab(index)}
        selectedTab={selectedTab}
        tabs={[
          { id: "1", label: "Basic info" },
          { id: "2", label: "Additional fields", icon: IconEnum.additional_fields },
          { id: "3", label: "Realations", icon: IconEnum.link },
          { id: "4", label: "Tags", icon: IconEnum.tags },
        ]}
      />
      {selectedTab === 0 ? (
        <>
          <div className="flex w-full flex-col gap-2 lg:flex-row lg:flex-nowrap lg:items-center">
            <div className="w-full lg:w-1/2">
              <Input label="First name" name="first_name" onChange={handleChange} value={character?.first_name || ""} />
            </div>
            <div className="w-full lg:w-1/2">
              <Input label="Nickname (optional)" name="nickname" onChange={handleChange} value={character?.nickname || ""} />
            </div>
            <div className="w-full lg:w-1/2">
              <Input label="Last name (optional)" name="last_name" onChange={handleChange} value={character?.last_name || ""} />
            </div>
          </div>
          <ImageSelect
            isLoading={isFetchingImages}
            label="Select character avatar (optional)"
            name="portrait_id"
            onChange={handleChange}
            options={images}
            type="images"
            value={character?.portrait_id ?? ""}
          />
          <Input label="Age (optional)" name="age" onChange={handleChange} type="number" value={character?.age || ""} />
          <div className="flex w-full flex-col gap-2 lg:flex-row lg:flex-nowrap lg:items-center">
            <div className="w-full lg:w-1/3">
              <Input
                label="Day of birth (optional)"
                name="dayOfBirth"
                onChange={handleChange}
                type="number"
                value={character?.dayOfBirth || ""}
              />
            </div>
            <div className="w-full lg:w-1/3">
              <Input
                label="Month of birth (optional)"
                name="monthOfBirth"
                onChange={handleChange}
                type="number"
                value={character?.monthOfBirth || ""}
              />
            </div>
            <div className="w-full lg:w-1/3">
              <Input
                label="Year of birth (optional)"
                name="yearOfBirth"
                onChange={handleChange}
                type="number"
                value={character?.yearOfBirth || ""}
              />
            </div>
          </div>
        </>
      ) : null}
      {selectedTab === 1 ? (
        <ul className="flex flex-col gap-y-2">
          {templates?.data?.map((t) => (
            <li key={t.id} className="flex flex-col gap-y-2">
              <div className="flex items-center gap-x-2">
                <Checkbox
                  name={t.id}
                  onChange={() => {
                    const temp = { ...fields };
                    if (Object.keys(fields).includes(t.id)) delete temp[t.id];
                    else temp[t.id] = {};
                    setFields(temp);
                  }}
                  value={Object.keys(fields).includes(t.id)}
                />
                <span className="select-none text-xl">{t.title}</span>
              </div>
              {Object.keys(fields).includes(t.id) ? (
                <div className="flex flex-col gap-y-2">
                  {t.fields.map((f) => (
                    <CharacterFieldInputs
                      key={f.id}
                      {...f}
                      handleChange={handleChangeFields}
                      value={fields?.[f.parentId]?.[f.id] || ""}
                    />
                  ))}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
      <Button
        icon={character?.id ? IconEnum.save : IconEnum.add}
        isDisabled={!character?.first_name}
        label={character?.id ? "Update" : "Create"}
        onClick={async () => {
          if (character) {
            if (character?.id)
              await update({ data: { ...character, id: character.id }, relations: { characterFieldTemplates: fields } });
            else await create({ data: character, relations: { characterFieldTemplates: fields } });
          }
          resetDrawerAtom();
        }}
        variant="success"
      />
    </>
  );
}
