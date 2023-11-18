export const baseURLS = {
  baseServer: `http://localhost:${import.meta.env.VITE_SERVER_PORT}/api/v1`,
  basePublicServer: `http://localhost:${import.meta.env.VITE_SERVER_PORT}/public/api/v1`,
};

export const ResponseMessageEnum = {
  entity_create: "Entity successfully created",
  entity_update: "Entity successfully updated.",
  no_entity: "This entity does not exist.",
};
