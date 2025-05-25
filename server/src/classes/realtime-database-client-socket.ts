import { v4 as uuid } from "uuid";

import type { WebSocket, RawData } from "ws";

import type {
	SET_DISCONNECTION_HANDLER,
	SOCKET_MESSAGE_FROM_CLIENT,
} from "../types/message";

import { validateMessageFromClient } from "../config/message-validator";

class RealtimeDatabaseClientSocket {
	private listeningTo = new Set<string>();
	private detachActions: SET_DISCONNECTION_HANDLER[] = [];

	private connection: WebSocket;

	private messageListener: ((data: RawData, isBinary: boolean) => any) | null =
		null;

	public isAlive: boolean = true;

	public id = uuid();

	constructor(connection: WebSocket) {
		this.connection = connection;
	}

	listenToChange(dataPath: string) {
		return this.listeningTo.add(dataPath);
	}

	detachFromChange(dataPath: string) {
		return this.listeningTo.delete(dataPath);
	}

	onDetach(action: SET_DISCONNECTION_HANDLER) {
		return this.detachActions.push(action);
	}

	onMessage(callback: (data: string | Record<string, any>) => any) {
		if (this.messageListener)
			this.connection.off("message", this.messageListener);

		this.messageListener = (data: RawData, isBinary: boolean) => {
			if (isBinary) return; // Not supported

			try {
				const message = JSON.parse(
					data.toString()
				) as SOCKET_MESSAGE_FROM_CLIENT;

				const isValidMessage = validateMessageFromClient(message).isValid;

				if (!isValidMessage) return;

				callback(message);
			} catch {
				// JSON formatted messages are the only ones supported
				return;
			}
		};

		this.connection.on("message", this.messageListener);
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
}

export default RealtimeDatabaseClientSocket;
