import { ColumnDef } from "@tanstack/react-table";
import { SetStateAction, useSetAtom } from "jotai";
import { Dispatch, useEffect } from "react";
import { useParams } from "react-router-dom";

import { Avatar, Button, createColumnHelper, Dropdown, Table, TablePageLayout } from "../../components";
import { useGetEntity, useTable } from "../../hooks";
import { DrawerAtomType } from "../../types";
import { AnswerValueType, QuestionnaireType, QuestionType } from "../../types/EntityTypes/questionnaireTypes";
import { drawerAtom, getImageURL, getQuestionColumnWidth, IconEnum, navbarTitleAtom } from "../../utils";

function getAnswerValue(type: QuestionType["type"], options: { id: string; value: string }[], value: AnswerValueType) {
  if (type === "select_single" || type === "select_multiple") return options.find((opt) => opt.id === value)?.value || "";
  if (type === "boolean") return value ? "Yes" : "No";

  return value;
}
const columnHelper = createColumnHelper<QuestionType & { project_id: string; portrait_id?: string }>();

function getQuestionnaireColumns(
  questionnaire_id: string,
  questions: QuestionType[],
  setDrawer: Dispatch<SetStateAction<DrawerAtomType>>,
) {
  const columns: ColumnDef<any, any>[] = [
    columnHelper.display({
      id: "portrait_id",
      header: "Portrait",
      cell: ({ row }) => (
        <div className="flex w-full items-center justify-center">
          <Avatar hasShowImage image={getImageURL(row.original.project_id, "images", row.original.portrait_id)} size="sm" />
        </div>
      ),
      meta: {
        pinned: true,
        noLink: true,
        centered: true,
      },
      minSize: 4.5,
      maxSize: 4.5,
    }),
    columnHelper.accessor("title", {
      id: "title",
      header: "Title",
      cell: (info) => info.getValue(),
      meta: {
        pinned: true,
        sortable: true,
      },
      minSize: 12,
      size: 12,
    }),
  ];

  for (let index = 0; index < questions.length; index += 1) {
    const { minSize, maxSize } = getQuestionColumnWidth(questions[index]?.type || "text");

    columns.push(
      columnHelper.accessor(questions[index].id as any, {
        header: questions[index].title,
        cell: (info) => {
          return info.getValue();
        },
        minSize,
        maxSize,
      }),
    );
  }
  columns.push(
    columnHelper.display({
      id: "actions",
      header: "Actions",
      size: 5,
      maxSize: 5,
      minSize: 5,
      meta: { centered: true, noLink: true },
      cell: ({ row }) => (
        <Dropdown
          allowedPlacements={["left", "left-end", "left-start"]}
          items={[
            {
              id: "1",
              title: "Fill out questionnaire",
              icon: IconEnum.check_circle,
              onClick: () =>
                setDrawer((prev) => ({
                  ...prev,
                  title: "Fill out questionnaire",
                  type: "questionnaire_answer",
                  data: { id: questionnaire_id, character_id: row.original.id, blueprint_instance_id: undefined },
                })),
            },
          ]}>
          <div>
            <Button hasNoBackground icon={IconEnum.actions} iconSize={28} isIconOnly onClick={undefined} />
          </div>
        </Dropdown>
      ),
    }),
  );
  return columns;
}

export function AnswersView() {
  const { questionnaire_id } = useParams();
  const setNavbarTitle = useSetAtom(navbarTitleAtom);
  const setDrawer = useSetAtom(drawerAtom);
  const {
    data: questionnaireData,
    isLoading,
    isFetching,
  } = useGetEntity<QuestionnaireType>(questionnaire_id, "questionnaires", {
    fields: ["title", "owner_id"],
    relations: { questions: true, characters: true, blueprint_instances: true },
  });

  useEffect(() => {
    if (questionnaireData?.data?.title) {
      document.title = `The Arkive | Questionnaires | ${questionnaireData?.data?.title}`;
      setNavbarTitle(`The Arkive | Questionnaires | ${questionnaireData?.data?.title}`);
    }
  }, [questionnaireData, isFetching]);
  const [{ selection }, dispatch] = useTable({ selection: {} });

  const formatted = (questionnaireData?.data?.characters || []).map((char) => {
    const answers: Record<string, any> = {};

    for (let index = 0; index < char.answers.length; index += 1) {
      const question = questionnaireData?.data?.questions?.find((q) => q.id === char.answers[index].parent_id);
      answers[char.answers[index].parent_id] = getAnswerValue(
        question?.type || "text",
        question?.options || [],
        char.answers[index].value || "",
      );
    }

    return {
      id: char.id,
      title: char.full_name,
      project_id: char.project_id,
      portrait_id: char.portrait_id,
      ...answers,
    };
  });

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-end gap-x-2">
        <div className="w-fit max-w-32 lg:w-32">
          <Button
            icon={IconEnum.add}
            label="Add entity"
            onClick={() => {
              setDrawer((prev) => ({
                ...prev,
                size: "lg",
                title: "Add entity to questionnaire",
                type: "questionnaire_add",
                data: { id: questionnaire_id as string },
              }));
            }}
          />
        </div>
        <div className="w-fit max-w-64 lg:w-64">
          <Button
            icon={IconEnum.edit}
            label="Edit current questionnaire"
            onClick={() => {
              setDrawer((prev) => ({
                ...prev,
                size: "lg",
                title: "Edit questionnaire",
                type: "questionnaires",
                data: { id: questionnaire_id },
              }));
            }}
          />
        </div>
      </div>
      <TablePageLayout>
        <div className="w-full flex-1 overflow-hidden">
          <Table
            columns={
              isLoading
                ? []
                : getQuestionnaireColumns(questionnaire_id as string, questionnaireData?.data?.questions || [], setDrawer)
            }
            config={{
              hasSelect: true,
              selection,
            }}
            data={formatted}
            dispatch={dispatch}
            isLoading={isLoading}
            skeletonLimit={10}
            type="characters"
          />
        </div>
      </TablePageLayout>
    </div>
  );
}
