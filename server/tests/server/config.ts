import serverConfig from "../../src/config/index.ts";

export const SERVER_HTTP_URL = `http://localhost:${serverConfig.WS_PORT}`;
export const SERVER_WS_URL = `ws://localhost:${serverConfig.WS_PORT}`;