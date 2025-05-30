import startWebSocketServer from "../server";

let mockServer, mockSetServerEnv;

export async function startupTestWebSocketServer(
	env: Record<string, string | number> = { HEART_BEAT_TIME_DIFF: 150 }
) {
	const { server: startedWebSocketServer, setServerEnv: serverEnvSetter } =
		await startWebSocketServer(env);

	mockServer = startedWebSocketServer;
	mockSetServerEnv = serverEnvSetter;
}

export async function stopAnyRunningTestWebSocketServer() {
	return new Promise((res, rej) => {
		mockServer.close((err: Error) => {
			console.log("Error closing the server:", err);
			if (err) return rej(err);
			mockSetServerEnv = () => null;
			res(true);
		});
	});
}

export async function restartWebSocketServer(
	env?: Record<string, string | number>
) {
	await stopAnyRunningTestWebSocketServer();

	await startupTestWebSocketServer(env);
}
