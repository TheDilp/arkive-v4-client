import { useGetSubEntity } from "../../../../../hooks";
import { WordType } from "../../../../../types";
import { Tooltip } from "../../../..";

type Props = {
  title: string;
  id: string | undefined;
  label: string;
  isDisabledTooltip?: boolean;
};

export function WordMentionTooltip({ id }: Pick<Props, "id">) {
  const { data: existingWord, isLoading } = useGetSubEntity<WordType>(
    id as string,
    "words",
    { fields: ["id", "title", "translation", "description"] },
    { enabled: !!id, queryKeyConcat: ["mention"], staleTime: 5 * 60 * 1000 },
  );
  return (
    <div className="h-fit min-h-[4rem] w-fit min-w-[10rem] rounded border border-zinc-700 bg-zinc-800 p-2 shadow">
      <div className="flex flex-col whitespace-pre-line font-lato font-light">
        {isLoading ? <div className="">LOADING...</div> : null}
        <span className="italic">
          {existingWord?.data?.title ? `(${existingWord?.data?.title}: ${existingWord?.data?.translation})` : null}
        </span>
        {existingWord?.data?.description && !isLoading ? existingWord?.data.description : null}
      </div>
    </div>
  );
}
export function WordMention({ title, id, label, isDisabledTooltip }: Props) {
  return (
    <Tooltip arrowColor="#3f3f46" content={<WordMentionTooltip id={id} />} isDisabled={isDisabledTooltip ?? false}>
      <span className="cursor-pointer text-sm font-light italic">
        {title || label}
        <sup>*</sup>
      </span>
    </Tooltip>
  );
}
