export type CreateType<EntityType> = Omit<EntityType, "id">;
export type UpdateType<EntityType> = Partial<EntityType>;
export type ValueOf<T> = T[keyof T];
