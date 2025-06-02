import { v4 } from "uuid";

import WebSocket from "ws";

import { describe, expect, test, vi } from "vitest";

import { SERVER_WS_URL } from "./server/config";

describe.sequential("Tests for detach actions", async () => {
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

			// Create data at a path
			wsClient1.send(
				JSON.stringify({
					type: "create_data",
					dataPath: "/users/uid-abc",
					data: { isLoggedIn: true },
				})
			);

			// Mark a path to be deleted when ws client 1 disconnects
			wsClient1.send(
				JSON.stringify({
					message_id: v4(),
					type: "action_on_disconnect",
					action: {
						type: "delete_data",
						dataPath: "/users/uid-abc",
					},
				})
			);

			// Mount listener from second websocket for the path we'll delete with the detach listener
			let responseReceivedFromServerOnDelete: any = null;

			wsClient2.on("message", (data) => {
				responseReceivedFromServerOnDelete = JSON.parse(data.toString());
			});

			const messageToServer = {
				message_id: v4(),
				type: "subscribe",
				dataPath: "/users/uid-abc",
			};

			wsClient2.send(JSON.stringify(messageToServer));

			// Now disconnect ws client 1
			wsClient1.close();

			await vi.waitUntil(() => responseReceivedFromServerOnDelete !== null);

			console.log(responseReceivedFromServerOnDelete)

			expect(responseReceivedFromServerOnDelete).toBeTruthy();
		}
	);
});
