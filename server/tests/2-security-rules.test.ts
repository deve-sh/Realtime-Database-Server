import { v4 } from "uuid";

import WebSocket from "ws";

import { describe, expect, test, vi } from "vitest";

import { SERVER_WS_URL } from "./server/config";

import mockStarterSecurityRules from "./mocks/dummy-starter-security-rules";

describe.sequential(
	"Tests for messaging and responses from server for data",
	async () => {
		test.sequential(
			"messages are sent to the server and properly acknowledged basis security rules",
			async () => {
				const wsClient = new WebSocket(SERVER_WS_URL, {
					headers: { Authorization: "API-Key <dummy-key>" },
				});

				await vi.waitUntil(() => wsClient.readyState === wsClient.OPEN);

				let responseReceivedFromServer: any = null;

				wsClient.on("message", (data) => {
					responseReceivedFromServer = JSON.parse(data.toString());
				});

				const messageToServer = {
					message_id: v4(),
					type: "subscribe",
					dataPath: "/users/uid-abc",
				};
				wsClient.send(JSON.stringify(messageToServer));

				await vi.waitUntil(() => responseReceivedFromServer !== null);

				expect(responseReceivedFromServer.replied_to).toBe(
					messageToServer.message_id
				);
				expect(responseReceivedFromServer.status).toBe(401);
				expect(responseReceivedFromServer.error).toBe("Not allowed");
				expect(responseReceivedFromServer.data).toBeFalsy();
			}
		);

		test.sequential(
			"valid security rules are preserved and acknowledged",
			async () => {
				const wsClient = new WebSocket(SERVER_WS_URL, {
					headers: { Authorization: "API-Key <dummy-key>" },
				});

				await vi.waitUntil(() => wsClient.readyState === wsClient.OPEN);

				wsClient.send(
					JSON.stringify({
						message_id: v4(),
						type: "test_mode_set_env_variable",
						data: {
							key: "SECURITY_RULES",
							value: JSON.stringify(mockStarterSecurityRules),
						},
					})
				);

				let responseReceivedFromServer: any = null;

				wsClient.on("message", (data) => {
					responseReceivedFromServer = JSON.parse(data.toString());
				});

				const messageToServer = {
					message_id: v4(),
					type: "subscribe",
					dataPath: "/users/uid-abc",
				};
				wsClient.send(JSON.stringify(messageToServer));

				await vi.waitUntil(() => responseReceivedFromServer !== null);

				expect(responseReceivedFromServer.replied_to).toBe(
					messageToServer.message_id
				);
				expect(responseReceivedFromServer.status).toBe(200);
				expect(responseReceivedFromServer.error).toBeNull();
				expect(responseReceivedFromServer.data).not.toBeFalsy();
			}
		);
	}
);
