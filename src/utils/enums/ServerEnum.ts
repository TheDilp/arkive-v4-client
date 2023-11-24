export const baseURLS = {
  baseServer: `${import.meta.env.DEV ? "http://localhost" : "https://thearkive.app"}:${
    import.meta.env.VITE_SERVER_PORT
  }/api/v1`,
  basePublicServer: `${import.meta.env.DEV ? "http://localhost" : "https://thearkive.app"}:${
    import.meta.env.VITE_SERVER_PORT
  }/public/api/v1`,

  baseThumbnailServer: "https://arkive-v4-thumbnail-service.up.railway.app",
};

export const ResponseMessageEnum = {
  entity_create: "Entity successfully created",
  entity_update: "Entity successfully updated.",
  no_entity: "This entity does not exist.",
};
