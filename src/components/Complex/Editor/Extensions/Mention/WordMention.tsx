import { useQuery } from "@tanstack/react-query";

import { Tooltip } from "../../../..";

type Props = {
  title: string;
  id: string | undefined;
  label: string;
  isDisabledTooltip?: boolean;
};

export function WordMentionTooltip({ id }: Pick<Props, "id">) {
  const { data, isLoading } = useQuery<WordType>({
    queryKey: ["words", id],
    queryFn: async () => {
      // return FetchFunction({ url: `${baseURLS.baseServer}getsingleword`, method: "POST", body: JSON.stringify({ id }) });
    },
    staleTime: 5 * 60 * 1000,
  });
  return (
    <div className="h-fit w-fit max-w-[20rem] rounded border border-zinc-800 bg-black p-2 shadow">
      <div className="font-Lato whitespace-pre-line font-light">
        {isLoading ? <div className="h-4 w-4">LOADING...</div> : null}
        <span className="italic">{data?.dictionary?.title ? `(${data?.dictionary?.title}: ${data?.translation}) ` : null}</span>
        {data?.description && !isLoading ? data.description : null}
      </div>
    </div>
  );
}
export function WordMention({ title, id, label, isDisabledTooltip }: Props) {
  return (
    <Tooltip content={<WordMentionTooltip id={id} />} isDisabled={isDisabledTooltip ?? false}>
      <span className="cursor-pointer font-light italic">
        {title || label}
        <sup>*</sup>
      </span>
    </Tooltip>
  );
}
