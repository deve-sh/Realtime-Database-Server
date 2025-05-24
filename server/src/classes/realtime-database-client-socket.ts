import { v4 as uuid } from "uuid";

import type { WebSocket, RawData } from "ws";

import type { SET_DISCONNECTION_HANDLER } from "../types/message";

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
				callback(JSON.parse(data.toString()));
			} catch {
				callback(data.toString());
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
