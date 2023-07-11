import { TableActionType, TableDispatch, TableParams } from "../../types";
import { deleteObjectProps } from "../../utils";
import { useReducer } from "react";

const tableReducerFn = (state: TableParams, action: TableActionType): TableParams => {
  switch (action.type) {
    case "setFilter": {
      let tempFilters = { ...state.filters };
      const { field } = action.payload;
      if (action?.payload?.and?.length) {
        if (tempFilters?.and) {
          const newFilters = tempFilters.and.filter((filt) => filt.field !== field);

          tempFilters = {
            ...tempFilters,
            and: newFilters.concat(action.payload.and),
          };
        } else {
          tempFilters = {
            ...tempFilters,
            and: action.payload.and,
          };
        }
      } else {
        tempFilters = tempFilters?.and
          ? { ...tempFilters, and: tempFilters.and.filter((filt) => filt.field !== field) }
          : tempFilters;
      }
      if (action?.payload?.or?.length) {
        if (tempFilters?.or) {
          const newFilters = tempFilters.or.filter((filt) => filt.field !== field);
          tempFilters = { ...tempFilters, or: newFilters.concat(action.payload.or) };
        } else {
          tempFilters = { ...tempFilters, or: action.payload.or };
        }
      } else {
        tempFilters = tempFilters?.or
          ? { ...tempFilters, or: tempFilters.or.filter((filt) => filt.field !== field) }
          : tempFilters;
      }

      return { ...state, filters: tempFilters };
    }
    case "removeFilterByField": {
      if (action.payload) {
        return {
          ...state,
          filters: {
            ...state.filters,
            and: (state.filters?.and || []).filter((filt) => filt.field !== action.payload),
            or: (state.filters?.or || []).filter((filt) => filt.field !== action.payload),
          },
        };
      }
      return state;
    }
    case "setPagination":
      return { ...state, pagination: { ...state.pagination, ...action.payload } };
    case "setSort": {
      if (action.payload?.field && action.payload?.sort) {
        return { ...state, orderBy: action.payload };
      }
      if (action?.payload?.field && action.payload.sort === null) {
        return deleteObjectProps(state, ["orderBy"]);
      }
      return { ...state };
    }

    case "removeFilter": {
      if (action.payload?.and) {
        return {
          ...state,
          filters: { ...state.filters, and: (state.filters?.and || []).filter((filt) => filt.id !== action.payload.and?.id) },
        };
      }
      if (action.payload?.or) {
        return {
          ...state,
          filters: { ...state.filters, or: (state.filters?.or || []).filter((filt) => filt.id !== action.payload.or?.id) },
        };
      }
      return state;
    }

    // case "clearFilters": {
    //   const newState: Partial<typeof state> = {
    //     ...state,
    //     filters: {
    //       ...state.filters,
    //       and: (state.filters?.and || []).filter((filt) => filt.field !== action.payload.filters?.and?.[0]?.field),
    //     },
    //   };
    //   if (newState?.filters?.and?.length === 0) {
    //     newState.filters = deleteObjectProps(newState.filters, ["and"]);
    //   }
    //   if (newState?.filters?.or?.length === 0) {
    //     newState.filters = deleteObjectProps(newState.filters, ["or"]);
    //   }
    //   return newState;
    // }

    // case "setSelected":
    //   if (state?.selection?.[action?.payload?.page] && includes(state?.selection?.[action?.payload?.page], action.payload.id)) {
    //     return {
    //       ...state,
    //       selection: {
    //         ...state.selection,
    //         [action.payload.page]: filter(state.selection[action?.payload?.page], (id) => id !== action.payload.id),
    //       },
    //     };
    //   }
    //   if (state.selection[action?.payload?.page]) {
    //     return {
    //       ...state,
    //       selection: {
    //         ...state.selection,
    //         [action.payload.page]: [...state.selection[action.payload.page], action.payload.id],
    //       },
    //     };
    //   }
    //   return {
    //     ...state,
    //     selection: { ...state.selection, [action.payload.page]: [action.payload.id] },
    //   };
    // case "setAllSelected":
    //   if (typeof action?.payload?.page === "number" && action?.payload?.ids) {
    //     return { ...state, selection: { ...state.selection, [action.payload.page]: action.payload.ids } };
    //   }
    //   if (typeof action?.payload?.page === "number" && !action?.payload?.ids) {
    //     const tempSelection = { ...state.selection };
    //     tempSelection[action.payload.page] = [];
    //     return { ...state, selection: tempSelection };
    //   }
    //   return { ...state, selection: {} };

    // case "clearSelected":
    //   return { ...state, selection: {} };
    default:
      return state;
  }
};

export function useTable({ orderBy, pagination, filters }: TableParams): [state: TableParams, dispatch: TableDispatch] {
  const [state, dispatch] = useReducer(tableReducerFn, { orderBy, pagination, filters });
  return [state, dispatch];
}
