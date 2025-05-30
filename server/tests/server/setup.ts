import startWebSocketServer from "../server";

export default async function startupTestWebSocketServer(
	env?: Record<string, string | number>
) {
	const { server, setServerEnv } = startWebSocketServer(env);

	(globalThis as any).__server = server;
	(globalThis as any).__setServerEnv = setServerEnv;
}

function stopAnyRunningTestWebSocketServer() {
	(globalThis as any).__server.close();
	(globalThis as any).__setServerEnv = () => null;
}

export async function restartWebSocketServer(
	env?: Record<string, string | number>
) {
	stopAnyRunningTestWebSocketServer();
	startupTestWebSocketServer(env);
}

export const teardown = stopAnyRunningTestWebSocketServer;
