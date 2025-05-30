import WebSocket from "ws";

import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";

import { SERVER_WS_URL } from "./server/config";

import {
	startupTestWebSocketServer,
	stopAnyRunningTestWebSocketServer,
} from "./server/setup";

describe.sequential("Server should accept and deny connections as expected", async () => {
	beforeAll(async () => {
		await startupTestWebSocketServer();
	});

	afterAll(async () => {
		await stopAnyRunningTestWebSocketServer();
	});

	test.sequential("connection denying when auth header isn't sent", async () => {
		const wsClient = new WebSocket(SERVER_WS_URL);

		await vi.waitUntil(() => wsClient.readyState === wsClient.CLOSED);

		expect(wsClient.readyState).toBe(wsClient.CLOSED);
	});

	test.sequential("connection acceptance when auth header is sent", async () => {
		const wsClient = new WebSocket(SERVER_WS_URL, {
			headers: { Authorization: "Bearer dummy-token" },
		});

		await vi.waitUntil(() => wsClient.readyState === wsClient.OPEN);

		expect(wsClient.readyState).toBe(wsClient.OPEN);

		await wsClient.close();
	});

	test.sequential("there are pings coming from the server for heartbeat checks", async () => {
		const wsClient = new WebSocket(SERVER_WS_URL, {
			headers: { Authorization: "API-Key <dummy-key>" },
		});

		let pingReceived = false;

		wsClient.on("ping", () => {
			pingReceived = true;
		});

		await vi.waitUntil(() => wsClient.readyState === wsClient.OPEN);
		await vi.waitUntil(() => pingReceived === true);

		expect(pingReceived).toBe(true);
	});
});
