import { config as setupEnvVarFileIfAny } from "dotenv";

setupEnvVarFileIfAny();

import { WebSocketServer } from "ws";

import { fileURLToPath } from "url";
import { argv } from "process";

import { setServerEnv } from "./config/env.ts";

/*
	{
		WS_PORT?: number;
		MAX_CONNECTIONS?: number;
		HEART_BEAT_TIME_DIFF?: number;
		SECURITY_RULES?: string;
		STORAGE_LAYER?: string;
	}
*/
type InitEnv = Record<string, number | string | boolean>;

function startServer(
	initEnv?: InitEnv
): Promise<{ server: WebSocketServer; setServerEnv: typeof setServerEnv }> {
	return new Promise(async (resolve) => {
		if (initEnv) {
			for (let envVar in initEnv) setServerEnv(envVar, initEnv[envVar]);
		}

		const { default: validateApiKey } = await import(
			"./middlewares/validate-api-key.ts"
		);
		const { default: commonConfig } = await import("./config/index.ts");

		const { default: SocketConnectionManager } = await import(
			"./classes/connections.ts"
		);

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
			resolve({ server: webSocketServer, setServerEnv });
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
	});
}

if (fileURLToPath(import.meta.url) === argv[1]) {
	// If the script is being run directly, start the server
	startServer();
	// Else, if the script is an import (Either via a library or via a testing script, don't start, just export the function)
}

export default startServer;
