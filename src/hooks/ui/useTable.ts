import { useReducer } from "react";

import { TableActionType, TableDispatch, TableParams } from "../../types";
import { deleteObjectProps } from "../../utils";

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

      return { ...state, pagination: { limit: state.pagination?.limit || 10, page: 0 }, filters: tempFilters };
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
    case "removeFilter": {
      if (action.payload?.and) {
        return {
          ...state,
          pagination: { limit: state.pagination?.limit || 10, page: 0 },
          filters: { ...state.filters, and: (state.filters?.and || []).filter((filt) => filt.id !== action.payload.and?.id) },
        };
      }
      if (action.payload?.or) {
        return {
          ...state,
          pagination: { limit: state.pagination?.limit || 10, page: 0 },
          filters: { ...state.filters, or: (state.filters?.or || []).filter((filt) => filt.id !== action.payload.or?.id) },
        };
      }
      return state;
    }
    case "clearAllFilters": {
      const newState = deleteObjectProps({ ...state }, ["filters"]);

      return newState;
    }
    case "setRelationFilters": {
      if (action.payload) {
        return { ...state, relationFilters: action.payload };
      }
      return state;
    }
    case "setPagination":
      return { ...state, pagination: { ...state.pagination, ...action.payload } };
    case "setSort": {
      if (action.payload?.field && action.payload?.sort) {
        if (state.orderBy?.length) {
          const fieldIdx = state.orderBy.findIndex((ob) => ob.field === action.payload.field);

          if (fieldIdx > -1) {
            const newOrderBy = state.orderBy.splice(fieldIdx);
            newOrderBy.push(action.payload);
            return { ...state, orderBy: newOrderBy };
          }

          return { ...state, orderBy: state?.orderBy?.length ? [...state.orderBy, action.payload] : [action.payload] };
        }
        return { ...state, orderBy: [action.payload] };
      }
      if (action?.payload?.field && action.payload.sort === null) {
        return { ...state, orderBy: (state.orderBy || [])?.filter((ob) => ob.field !== action.payload.field) };
      }
      return { ...state };
    }
    case "setSelection": {
      if (typeof state.pagination?.page === "number") {
        const {
          selection,
          pagination: { page },
        } = state;

        if (selection?.[page]) {
          if (!selection[page].includes(action.payload.row)) {
            return {
              ...state,
              selection: {
                ...(selection || {}),
                [page]: [...selection[page], action.payload.row],
              },
            };
          }
          return {
            ...state,
            selection: {
              ...(selection || {}),
              [page]: selection[page].filter((r) => r !== action.payload.row),
            },
          };
        }
        return {
          ...state,
          selection: {
            ...(selection || {}),
            [page || 0]: [action.payload.row],
          },
        };
      }
      if (state?.selection?.[0]?.includes(action.payload.row)) {
        return {
          ...state,
          selection: {
            0: [...(state.selection?.[0] || [])].filter((r) => r !== action.payload.row),
          },
        };
      }
      return {
        ...state,
        selection: {
          0: [...(state.selection?.[0] || []), action.payload.row],
        },
      };
    }
    case "selectAll": {
      return { ...state, selection: { ...(state.selection || {}), [state?.pagination?.page || 0]: action.payload.rows } };
    }
    case "clearSelection": {
      return { ...state, selection: {} };
    }

    default:
      return state;
  }
};

export function useTable({
  orderBy,
  selection,
  pagination,
  filters,
}: TableParams): [state: TableParams, dispatch: TableDispatch] {
  const [state, dispatch] = useReducer(tableReducerFn, { orderBy, selection, pagination, filters });
  return [state, dispatch];
}
