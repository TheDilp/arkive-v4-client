import { ColumnDef } from "@tanstack/react-table";
import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

import { Button, createColumnHelper, Table, TablePageLayout } from "../../components";
import { useGetEntity, useTable } from "../../hooks";
import { QuestionnaireType, QuestionType } from "../../types/EntityTypes/questionnaireTypes";
import { drawerAtom, IconEnum, navbarTitleAtom } from "../../utils";

const columnHelper = createColumnHelper<QuestionType>();

function getQuestionnaireColumns(questions: QuestionType[]) {
  const columns: ColumnDef<any, any>[] = [columnHelper.accessor("title", { header: "Title", maxSize: 15 })];

  for (let index = 0; index < questions.length; index += 1) {
    columns.push(
      columnHelper.accessor(questions[index].id as any, {
        header: questions[index].title,
        cell: (info) => info.getValue(),
      }),
    );
  }
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
      answers[char.answers[index].parent_id] = char.answers[index].value;
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
            columns={isLoading ? [] : getQuestionnaireColumns(questionnaireData?.data?.questions || [])}
            config={{
              hasSelect: true,
              // orderBy,
              // filters,
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
