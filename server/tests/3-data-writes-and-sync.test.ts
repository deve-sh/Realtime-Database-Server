import { v4 } from "uuid";

import WebSocket from "ws";

import { describe, expect, test, vi } from "vitest";

import { SERVER_WS_URL } from "./server/config";

import mockStarterSecurityRules from "./mocks/dummy-starter-security-rules";

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

				let messageReceivedOnUpdate: boolean = false;
				wsClient2.on("message", (data) => {
					if (JSON.parse(data.toString()).type === "value_updated")
						messageReceivedOnUpdate = true;
				});

				// Subscribe web socket client 2 to a path
				wsClient2.send(
					JSON.stringify({
						message_id: v4(),
						type: "subscribe",
						dataPath: "/users/uid-abc",
					})
				);

				await new Promise((resolve) => setTimeout(resolve, 500));

				// Send an update
				wsClient1.send(
					JSON.stringify({
						message_id: v4(),
						type: "create_data",
						dataPath: "/users/uid-abc",
						data: { isLoggedIn: true },
					})
				);

				wsClient1.send(
					JSON.stringify({
						message_id: v4(),
						type: "update_data",
						dataPath: "/users/uid-abc",
						data: { isLoggedIn: false },
					})
				);

				await vi.waitUntil(() => !!messageReceivedOnUpdate, { timeout: 1_000 });

				expect(messageReceivedOnUpdate).toBeTruthy();
			}
		);
	}
);
