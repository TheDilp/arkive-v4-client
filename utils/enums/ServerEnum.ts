export const baseURLS = {
  baseServer: `${
    import.meta.env.DEV ? `http://localhost:${import.meta.env.VITE_SERVER_PORT}` : import.meta.env.VITE_ARKIVE_EDITOR_SERVER
  }/api/v1`,
  basePublicServer: import.meta.env.VITE_ARKIVE_WIKI_SERVER,
  baseAuthServer: import.meta.env.VITE_ARKIVE_AUTH_SERVER,
  baseImageServer: import.meta.env.VITE_ARKIVE_IMAGE_SERVICE,
  baseWebsocketServer: `${
    import.meta.env.DEV
      ? `ws://localhost:${import.meta.env.VITE_SERVER_PORT}`
      : "wss://arkive-v4-server-production.up.railway.app"
  }`,
  basePublicClient: import.meta.env.VITE_WIKI_CLIENT_URL,
  baseGatewayServer: `${
    import.meta.env.DEV
      ? `http://localhost:${import.meta.env.VITE_SERVER_PORT}/gateway`
      : `${import.meta.env.VITE_ARKIVE_EDITOR_SERVER}/gateway`
  }`,
};

export function getServerUrl() {
  if (IS_PUBLIC) return baseURLS.basePublicServer;
  if (IS_GATEWAY) return baseURLS.baseGatewayServer;
  return baseURLS.baseServer;
}
