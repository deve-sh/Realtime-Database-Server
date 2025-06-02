import { v4 as uuid } from "uuid";

import type { WebSocket, RawData } from "ws";

import type {
	SET_DISCONNECTION_HANDLER,
	SOCKET_MESSAGE_FROM_CLIENT,
} from "../types/message.ts";
import type { JSONValue } from "../types/storage-interface.ts";

import validateAuthToken from "../middlewares/validate-token.ts";

import securityRules from "./security-rules.ts";
import dataStorage from "./storage/index.ts";
import devAndTestMode, {
	type TEST_MODE_MESSAGES_FROM_CLIENT,
} from "./dev-and-test-mode/index.ts";

import { validateMessageFromClient } from "../config/message-validator.ts";

class RealtimeDatabaseClientSocket {
	private listeningTo = new Set<string>();
	private detachActions: SET_DISCONNECTION_HANDLER[] = [];
	private connection: WebSocket;

	private authContext: Record<string, string | number> | null = null;

	private messageListener: ((data: RawData, isBinary: boolean) => any) | null =
		null;

	public isAlive: boolean = true;

	public id = uuid();

	constructor(connection: WebSocket) {
		this.connection = connection;

		this.messageListener = (data: RawData, isBinary: boolean) => {
			if (isBinary) return; // Not supported

			try {
				const message = JSON.parse(
					data.toString()
				) as SOCKET_MESSAGE_FROM_CLIENT;

				const isValidMessage = validateMessageFromClient(message).isValid;

				if (!isValidMessage) return;

				this.handleMessageFromClient(message);
			} catch {
				// JSON formatted messages are the only ones supported
				return;
			}
		};

		this.connection.on("message", this.messageListener);

		this.connection.on("close", () => {
			for (const detachAction of this.detachActions) {
				this.handleMessageFromClient(
					detachAction.action as SOCKET_MESSAGE_FROM_CLIENT
				);
			}
		});
	}

	listenToChange(dataPath: string) {
		return this.listeningTo.add(dataPath);
	}

	detachFromChange(dataPath: string) {
		return this.listeningTo.delete(dataPath);
	}

	markForDetach(action: SET_DISCONNECTION_HANDLER) {
		return this.detachActions.push(action);
	}

	ping() {
		return this.connection.ping();
	}

	pong(callback: () => void) {
		return this.connection.on("pong", callback);
	}

	terminateConnection() {
		return this.connection.terminate();
	}

	isListeningToPath(dataPath: string) {
		return Array.from(this.listeningTo).find((path) =>
			// Handles both exact path and any parent paths the socket might be listening to
			dataPath.startsWith(path)
		);
	}

	sendMessageToClient(message: any) {
		return this.connection.send(
			typeof message === "string" ? message : JSON.stringify(message)
		);
	}

	private async handleMessageFromClient(
		messageFromClient:
			| SOCKET_MESSAGE_FROM_CLIENT
			| TEST_MODE_MESSAGES_FROM_CLIENT
	) {
		if (process.env.NODE_ENV !== "production") {
			// operating in dev mode
			if (messageFromClient.type.startsWith("test_mode_"))
				return devAndTestMode.handleTestModeOperation(
					messageFromClient as TEST_MODE_MESSAGES_FROM_CLIENT
				);
		}

		switch (messageFromClient.type) {
			case "set_auth_context": {
				const authContext = await validateAuthToken(messageFromClient.token);
				this.authContext = authContext;
				break;
			}
			case "create_data":
			case "update_data":
			case "delete_data": {
				const isOpPermitted = await securityRules.isOperationAllowed({
					action: messageFromClient,
					authContext: this.authContext,
				});

				if (!isOpPermitted)
					return this.sendMessageToClient({
						error: "Not allowed",
						status: 401,
						replied_to: messageFromClient.message_id,
					});

				let opStatus = 201;
				let opError = null;

				if (messageFromClient.type === "create_data")
					await dataStorage.set(
						messageFromClient.dataPath,
						messageFromClient.data as JSONValue
					);

				if (messageFromClient.type === "update_data") {
					await dataStorage.set(
						messageFromClient.dataPath,
						messageFromClient.updates as JSONValue
					);
					opStatus = 200;
				}

				if (messageFromClient.type === "delete_data") {
					await dataStorage.delete(messageFromClient.dataPath);
					opStatus = 204;
				}

				return this.sendMessageToClient({
					error: opError,
					status: opStatus,
					replied_to: messageFromClient.message_id,
				});
			}
			case "subscribe": {
				const isOpPermitted = await securityRules.isOperationAllowed({
					action: messageFromClient,
					authContext: this.authContext,
				});

				if (!isOpPermitted)
					return this.sendMessageToClient({
						error: "Not allowed",
						status: 401,
						replied_to: messageFromClient.message_id,
					});

				await this.listenToChange(messageFromClient.dataPath);

				return this.sendMessageToClient({
					error: null,
					status: 200,
					replied_to: messageFromClient.message_id,
					data: dataStorage.get(messageFromClient.dataPath) || null,
				});
			}
			case "unsubscribe": {
				await this.detachFromChange(messageFromClient.dataPath);

				return this.sendMessageToClient({
					error: null,
					status: 200,
					replied_to: messageFromClient.message_id,
				});
			}
			case "action_on_disconnect": {
				const isOpPermitted = await securityRules.isOperationAllowed({
					action: messageFromClient.action,
					authContext: this.authContext,
				});

				if (!isOpPermitted)
					return this.sendMessageToClient({
						error: "Not allowed",
						status: 401,
						replied_to: messageFromClient.message_id,
					});

				await this.markForDetach(messageFromClient);

				return this.sendMessageToClient({
					error: null,
					status: 200,
					replied_to: messageFromClient.message_id,
				});
			}
			default:
				break;
		}
	}
}

export default RealtimeDatabaseClientSocket;
