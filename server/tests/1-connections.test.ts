import WebSocket from "ws";

import { describe, expect, test, vi } from "vitest";

import { SERVER_WS_URL } from "./server/config";

describe.sequential(
	"Server should accept and deny connections as expected",
	async () => {
		test.sequential(
			"connection denying when auth header isn't sent",
			async () => {
				const wsClient = new WebSocket(SERVER_WS_URL);

				await vi.waitUntil(() => wsClient.readyState === wsClient.CLOSED);

				expect(wsClient.readyState).toBe(wsClient.CLOSED);
			}
		);

		test.sequential(
			"connection acceptance when auth header is sent",
			async () => {
				const wsClient = new WebSocket(SERVER_WS_URL, {
					headers: { Authorization: "Bearer dummy-token" },
				});

				await vi.waitUntil(() => wsClient.readyState === wsClient.OPEN);

				expect(wsClient.readyState).toBe(wsClient.OPEN);

				await wsClient.close();
			}
		);
	}
);
