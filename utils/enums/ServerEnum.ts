export const baseURLS = {
  baseServer: `${
    import.meta.env.DEV
      ? `http://localhost:${import.meta.env.VITE_SERVER_PORT}`
      : "https://arkive-v4-auth-service-production.up.railway.app"
  }/api/v1`,
  basePublicServer: `${
    import.meta.env.DEV
      ? `http://localhost:${import.meta.env.VITE_PUBLIC_SERVER}`
      : "https://arkive-v4-auth-service-production.up.railway.app"
  }/public`,

  baseThumbnailServer: "https://arkive-v4-thumbnail-service.up.railway.app",
  baseWebsocketServer: `${
    import.meta.env.DEV
      ? `ws://localhost:${import.meta.env.VITE_SERVER_PORT}`
      : "wss://arkive-v4-server-production.up.railway.app"
  }`,
};

