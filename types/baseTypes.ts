import { UseMutateAsyncFunction, UseMutateFunction } from "@tanstack/react-query";

import { SelectOptionType } from "./ComponentTypes";
import { AllAvailableEntities } from "./EntityTypes";

export type Size = "4xl" | "3xs" | "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
export type Variant =
  | "primary"
  | "secondary"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "primary-bordered"
  | "secondary-bordered"
  | "info-bordered"
  | "success-bordered"
  | "warning-bordered"
  | "error-bordered";
export type AssetType = "images" | "map_images";
export type PositionType = (
  | "top"
  | "right"
  | "bottom"
  | "left"
  | "right-start"
  | "right-end"
  | "left-start"
  | "left-end"
  | "bottom-start"
  | "top-start"
  | "top-end"
  | "bottom-end"
)[];

export type ImagePreviewType = {
  id?: string;
  label?: string;
  title: string;
  url?: string;
  clearAction?: (id: string) => void;
  hasShowImage?: boolean;
};
export type onChangeValue = {
  name: string;
  value: string | string[] | undefined;
  label?: string;
  icon?: string;
  image?: SelectOptionType["image"];
};
export interface BaseComponentType {
  size?: Size;
  variant?: Variant;
}
export type HandleChangePropsType = { name: string; value: any | any[] } | { name: string; value: any | any[] }[];
export interface BaseFormComponentType extends BaseComponentType {
  isDisabled?: boolean;
  isLoading?: boolean;
}

export type DiceRollType = {
  value: number;
  valid: boolean;
  dice?: {
    value: number;
    critical: "success" | "failure" | null;
    rolls: {
      value: number;
      critical: "success" | "failure";
      order: number;
      type: "die" | "number";
      drop?: boolean | undefined;
    }[];
  }[];
  rolls?: {
    value: number;
    critical: "success" | "failure" | null;
    order: number;
    drop?: boolean | undefined;
    type: "die" | "number";
  }[];
  ops: ("+" | "-" | "/" | "*")[];
};

export type WebsocketEventType = "NEW_MESSAGE" | "NEW_NOTIFICATION" | "ROLE_UPDATED";

export type UpdatePublicManyType = UseMutateAsyncFunction<
  any,
  unknown,
  {
    data: {
      ids: string[];
      is_public: boolean;
    };
  },
  unknown
>;

export type DeleteManyType = UseMutateAsyncFunction<
  any,
  unknown,
  {
    data: {
      ids: string[];
    };
  },
  unknown
>;

export type BulkUpdateType = UseMutateFunction<
  any,
  unknown,
  {
    data: {
      data: {
        [key: string]: any;
        id: string;
        parent_id?: string | null | undefined;
      };
    }[];
  },
  unknown
>;

export type TagColorStatType = Record<string, number>;
export type TagEntityStatType = Record<string, { color: string; count: number }>;
export type MentionStatType = Record<
  string,
  {
    title: string;
    icon: string | undefined;
    image_id: string | undefined;
    parent_id: string | null;
    entity_type: AllAvailableEntities;
    count: number;
  }
>;
