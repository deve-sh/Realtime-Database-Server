import { v4 } from "uuid";

import WebSocket from "ws";

import { describe, expect, test, vi } from "vitest";

import { SERVER_WS_URL } from "./server/config";

describe.sequential(
	"Tests for messaging and responses from server for data",
	async () => {
		test.sequential(
			"changes should be relayed to WebSockets listening to a path",
			async () => {
				const wsClient1 = new WebSocket(SERVER_WS_URL, {
					headers: { Authorization: "API-Key <dummy-key>" },
				});
				const wsClient2 = new WebSocket(SERVER_WS_URL, {
					headers: { Authorization: "API-Key <dummy-key>" },
				});

				await vi.waitUntil(() => wsClient1.readyState === wsClient1.OPEN);
				await vi.waitUntil(() => wsClient2.readyState === wsClient2.OPEN);

				// Subscribe web socket client 2 to a path
				wsClient2.send(
					JSON.stringify({
						message_id: v4(),
						type: "subscribe",
						dataPath: "/users/uid-abc",
					})
				);

				// Send an update

				let messageReceivedOnUpdate: boolean = false;
				wsClient2.on("message", () => (messageReceivedOnUpdate = true));

				wsClient1.send(
					JSON.stringify({
						type: "create_data",
						dataPath: "/users/uid-abc",
						data: { isLoggedIn: true },
					})
				);

				await vi.waitUntil(() => !!messageReceivedOnUpdate);

				expect(messageReceivedOnUpdate).toBeTruthy();
			}
		);
	}
);
