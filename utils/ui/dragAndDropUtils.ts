import { DropResult } from "@hello-pangea/dnd";
import { Dispatch, SetStateAction } from "react";

export function reorder<ItemType>(list: ItemType[], startIndex: number, endIndex: number) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
}

export function onDragEnd<ItemType>(result: DropResult, items: ItemType[], setItems: Dispatch<SetStateAction<ItemType[]>>) {
  // dropped outside the list
  if (!result.destination) {
    return;
  }

  const newData = reorder(items, result.source.index, result.destination.index);

  setItems(newData);
}
