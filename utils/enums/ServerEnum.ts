export const baseURLS = {
  baseServer: `${
    import.meta.env.DEV ? `http://localhost:${import.meta.env.VITE_SERVER_PORT}` : import.meta.env.VITE_ARKIVE_EDITOR_SERVER
  }/api/v1`,
  basePublicServer: import.meta.env.VITE_ARKIVE_WIKI_SERVER,
  baseAuthServer: import.meta.env.VITE_ARKIVE_AUTH_SERVER,
  baseThumbnailServer: "https://arkive-v4-thumbnail-service.up.railway.app",
  baseWebsocketServer: `${
    import.meta.env.DEV
      ? `ws://localhost:${import.meta.env.VITE_SERVER_PORT}`
      : "wss://arkive-v4-server-production.up.railway.app"
  }`,
};
