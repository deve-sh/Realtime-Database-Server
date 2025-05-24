import { WebSocketServer } from "ws";

import validateAuth from "./middlewares/validateAuth.ts";
import commonConfig from "./config/index.ts";

import SocketConnectionManager from "./managers/connections.ts";

const webSocketServer = new WebSocketServer({ port: commonConfig.WS_PORT });

webSocketServer.on("connection", async (socketConnection, req) => {
	const authorizationHeader = req.headers["authorization"] || "";

	const isAuthHeaderValid = await validateAuth(authorizationHeader);

	if (!isAuthHeaderValid) return socketConnection.terminate();

	try {
		SocketConnectionManager.registerConnection(socketConnection);
	} catch (error) {
		socketConnection.terminate();
	}
});

webSocketServer.on("close", () => {
	console.log("Closing Server, destructing all open sockets");

	SocketConnectionManager._destruct();
});
