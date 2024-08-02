import { useEffect } from "react";

import { BlueprintFieldType, BlueprintInstanceBlueprintFieldType, EventStateType, HandleChangePropsType } from "../../../types";
import { checkIfDayCorrect, checkIfMonthCorrect, checkIfYearCorrect } from "../../../utils";
import { Input, Select } from "../../Form";
import { TemplateFieldContainer } from ".";

type Props = {
  title: string;
  name: string;
  handleChange: (params: HandleChangePropsType) => void;
  id: string;
  currentValue: BlueprintInstanceBlueprintFieldType["calendar"] | null;
  calendar?: BlueprintFieldType["calendar"];
  isCollapsible?: boolean;
  isDisabled?: boolean;
  isOpen?: boolean;
};

export function TemplateDateField({
  isOpen,
  title,
  name,
  handleChange,
  id,
  currentValue,
  calendar,
  isCollapsible,
  isDisabled,
}: Props) {
  const startMonthIdx = currentValue?.start_month_id
    ? calendar?.months?.findIndex((m) => m.id === currentValue?.start_month_id) ?? undefined
    : undefined;
  const endMonthIdx = currentValue?.end_month_id
    ? calendar?.months?.findIndex((m) => m.id === currentValue?.end_month_id)
    : null;

  // Not an actual event entity, just used
  // to calculate whether the date is correct
  const event: EventStateType = {
    start_day: currentValue?.start_day,
    start_month: startMonthIdx,
    start_year: currentValue?.start_year,
    end_day: currentValue?.end_day,
    end_month: endMonthIdx,
    end_year: currentValue?.end_year,
    parent_id: null,
  };

  const isYearCorrect = checkIfYearCorrect(currentValue?.start_year, currentValue?.end_year);
  const isMonthCorrect = checkIfMonthCorrect(event, isYearCorrect);
  const isDayCorrect = checkIfDayCorrect(event, isYearCorrect, isMonthCorrect);
  useEffect(() => {
    if (currentValue) {
      if (!currentValue?.end_month_id) {
        handleChange([
          { name: `${name}.calendar.end_day`, value: null },
          { name: `${name}.calendar.end_year`, value: null },
        ]);
      }
      if (!currentValue?.start_month_id) {
        handleChange([{ name: `${name}.calendar.start_day`, value: null }]);
      }
    }
  }, [currentValue?.end_month_id, currentValue?.start_month_id]);
  return (
    <TemplateFieldContainer isCollapsible={isCollapsible} isOpen={isOpen} label={title}>
      <span className="block min-h-[20px] truncate border-b border-zinc-700 text-sm text-zinc-300">{title}</span>
      <div className="flex flex-col gap-y-2">
        <div className="flex items-center justify-between gap-x-2">
          <Input
            isDisabled={isDisabled || typeof startMonthIdx !== "number"}
            label="Start day"
            max={typeof startMonthIdx === "number" ? calendar?.months?.[startMonthIdx]?.days : 0}
            min={1}
            name="start_day"
            onChange={({ value }) =>
              handleChange([
                { name: `${name}.id`, value: id },
                { name: `${name}.calendar.related_id`, value: calendar?.id },
                { name: `${name}.calendar.start_day`, value },
              ])
            }
            placeholder={typeof startMonthIdx !== "number" ? "Select a month." : ""}
            type="number"
            value={currentValue?.start_day ?? ""}
          />
          <Select
            isClearable
            isDisabled={isDisabled}
            label="Start month"
            name="start_month"
            onChange={({ value }) =>
              handleChange([
                { name: `${name}.id`, value: id },
                { name: `${name}.calendar.related_id`, value: calendar?.id },
                { name: `${name}.calendar.start_month_id`, value },
              ])
            }
            options={(calendar?.months || []).map((m) => ({ label: m.title, value: m.id }))}
            value={typeof startMonthIdx === "number" ? calendar?.months?.[startMonthIdx].id : undefined}
          />
          <Input
            isDisabled={isDisabled}
            label="Start year "
            name="start_year"
            onChange={({ value }) =>
              handleChange([
                { name: `${name}.id`, value: id },
                { name: `${name}.calendar.related_id`, value: calendar?.id },
                { name: `${name}.calendar.start_year`, value },
              ])
            }
            type="number"
            value={currentValue?.start_year || ""}
          />
        </div>
        <div className="grid grid-cols-3 gap-x-2">
          <Input
            helperText={isDayCorrect ? "" : "End day must be more or equal to start day if in the same month and year."}
            isDisabled={isDisabled || typeof endMonthIdx !== "number"}
            label="End day (optional)"
            max={typeof endMonthIdx === "number" ? calendar?.months?.[endMonthIdx].days : 0}
            min={1}
            name="end_day"
            onChange={({ value }) =>
              handleChange([
                { name: `${name}.id`, value: id },
                { name: `${name}.calendar.related_id`, value: calendar?.id },
                { name: `${name}.calendar.end_day`, value },
              ])
            }
            placeholder={typeof endMonthIdx !== "number" ? "Select a month." : ""}
            type="number"
            value={currentValue?.end_day || ""}
            variant={isDayCorrect ? "primary" : "error"}
          />
          <Select
            helperText={isMonthCorrect ? "" : "End month must be more or equal to start month if in the same year."}
            isClearable
            isDisabled={isDisabled}
            label="End month (optional)"
            name="end_month"
            onChange={({ value }) =>
              handleChange([
                { name: `${name}.id`, value: id },
                { name: `${name}.calendar.related_id`, value: calendar?.id },
                { name: `${name}.calendar.end_month_id`, value },
              ])
            }
            options={calendar?.months?.map((month) => ({ label: month.title, value: month.id })) || []}
            value={typeof endMonthIdx === "number" ? calendar?.months?.[endMonthIdx].id : undefined}
            variant={isMonthCorrect ? "primary" : "error"}
          />
          <Input
            helperText={isYearCorrect ? "" : "End year must be more or equal to start year."}
            isDisabled={isDisabled || typeof endMonthIdx !== "number"}
            label="End year (optional)"
            name="end_year"
            onChange={({ value }) =>
              handleChange([
                { name: `${name}.id`, value: id },
                { name: `${name}.calendar.related_id`, value: calendar?.id },
                { name: `${name}.calendar.end_year`, value },
              ])
            }
            placeholder={typeof endMonthIdx !== "number" ? "Select a month." : ""}
            type="number"
            value={currentValue?.end_year || ""}
            variant={isYearCorrect ? "primary" : "error"}
          />
        </div>
      </div>
    </TemplateFieldContainer>
  );
}
