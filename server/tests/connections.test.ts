import WebSocket from "ws";

import { describe, expect, test, vi } from "vitest";

import { SERVER_WS_URL } from "./server/config";

describe("Server should accept and deny connections as expected", async () => {
	test("connection denying when auth header isn't sent", async () => {
		const wsClient = new WebSocket(SERVER_WS_URL);

		await vi.waitUntil(() => wsClient.readyState === wsClient.CLOSED);

		expect(wsClient.readyState).toBe(wsClient.CLOSED);
	});

	test("connection acceptance when auth header is sent", async () => {
		const wsClient = new WebSocket(SERVER_WS_URL, {
			headers: { Authorization: "Bearer dummy-token" },
		});

		await vi.waitUntil(() => wsClient.readyState === wsClient.OPEN);

		expect(wsClient.readyState).toBe(wsClient.OPEN);

		await wsClient.close();
	});

	test("there are pings coming from the server for heartbeat checks", async () => {
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
