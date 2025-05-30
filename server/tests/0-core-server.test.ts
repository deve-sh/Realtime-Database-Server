import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { SERVER_HTTP_URL } from "./server/config";

import {
	startupTestWebSocketServer,
	stopAnyRunningTestWebSocketServer,
} from "./server/setup";

describe.sequential("Server should start up correctly", async () => {
	beforeAll(async () => {
		await startupTestWebSocketServer();
	});

	afterAll(async () => {
		await stopAnyRunningTestWebSocketServer();
	});

	test.sequential("Server start up and expected response", async () => {
		const response = await fetch(SERVER_HTTP_URL);
		expect(await response.text()).toMatch(/upgrade required/i);
	});
});
