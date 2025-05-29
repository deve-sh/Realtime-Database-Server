import { WebSocketServer } from "ws";

import validateApiKey from "./middlewares/validate-api-key.ts";
import commonConfig from "./config/index.ts";

import SocketConnectionManager from "./classes/connections.ts";

const reqInvalidityMap = new WeakMap();

const webSocketServer = new WebSocketServer({
	port: commonConfig.WS_PORT,
	verifyClient: async (info, done) => {
		const authorizationHeader = info.req.headers["authorization"] || "";

		const isAuthHeaderValid = await validateApiKey(authorizationHeader);

		if (!isAuthHeaderValid) reqInvalidityMap.set(info.req, false);

		return done(true);
	},
});

webSocketServer.on("listening", async () => {
	console.log("Web socket server listening");
});

webSocketServer.on("connection", async (socketConnection, request) => {
	try {
		if (reqInvalidityMap.has(request)) {
			socketConnection.send(JSON.stringify({ status: 401 }));
			reqInvalidityMap.delete(request);
			throw new Error("Not Allowed for connection");
		}
		SocketConnectionManager.registerConnection(socketConnection);
	} catch (error) {
		socketConnection.terminate();
	}
});

webSocketServer.on("close", () => {
	console.log("Closing Server, destructing all open sockets");

	SocketConnectionManager._destruct();
});

export default webSocketServer;
