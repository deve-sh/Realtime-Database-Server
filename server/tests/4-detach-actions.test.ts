import { v4 } from "uuid";

import WebSocket from "ws";

import { describe, expect, test, vi } from "vitest";

import { SERVER_WS_URL } from "./server/config";

import mockStarterSecurityRules from "./mocks/dummy-starter-security-rules";

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

			// Allow for security rules
			wsClient1.send(
				JSON.stringify({
					message_id: v4(),
					type: "test_mode_set_env_variable",
					data: {
						key: "SECURITY_RULES",
						value: JSON.stringify(mockStarterSecurityRules),
					},
				})
			);

			// Create data at a path
			wsClient1.send(
				JSON.stringify({
					message_id: v4(),
					type: "create_data",
					dataPath: "/users/uid-abc",
					data: { isLoggedIn: true },
				})
			);

			// Mark a path to be deleted when ws client 1 disconnects
			const messageId = v4();

			wsClient1.send(
				JSON.stringify({
					message_id: messageId,
					type: "action_on_disconnect",
					action: {
						message_id: messageId,
						type: "delete_data",
						dataPath: "/users/uid-abc",
					},
				})
			);

			// Mount listener from second websocket for the path we'll delete with the detach listener
			let responseReceivedFromServerOnDelete: any = null;

			wsClient2.on("message", (data) => {
				if (JSON.parse(data.toString()).type === "value_deleted")
					responseReceivedFromServerOnDelete = JSON.parse(data.toString());
			});

			const messageToServer = {
				message_id: v4(),
				type: "subscribe",
				dataPath: "/users/uid-abc",
			};

			wsClient2.send(JSON.stringify(messageToServer));

			await new Promise((resolve) => setTimeout(resolve, 500));

			// Now disconnect ws client 1
			wsClient1.close();

			await vi.waitUntil(() => responseReceivedFromServerOnDelete !== null, {
				timeout: 1_000,
			});

			expect(responseReceivedFromServerOnDelete).toBeTruthy();
		}
	);
});
