import type WebSocket from "ws";

import { v4 as uuid } from "uuid";

import commonConfig from "../config/index.ts";

class SocketConnectionManager {
	static HEART_BEAT_TIME_DIFF = 15_000;

	private connections = new Map<
		string,
		{ isAlive: boolean; socket: WebSocket }
	>();

	private heartBeatRegisteredInterval: NodeJS.Timeout | void;

	private sendPingHeartBeatToCheckForConnection(connection: WebSocket) {
		connection.ping();
	}

	constructor() {
		this.heartBeatRegisteredInterval = setInterval(() => {
			const connectionsAvailable = Array.from(this.connections.keys());

			connectionsAvailable.forEach((connectionId) => {
				const connection = this.connections.get(connectionId);

				if (!connection) return;

				if (!connection.isAlive) {
					// Response from client hasn't come back in the defined timeframe, terminate this connection and clean it up.
					connection.socket.terminate();
					this.connections.delete(connectionId);

					return;
				}

				connection.isAlive = false; // Mark it as not alive, and wait for 'pong' to come back from client.

				this.sendPingHeartBeatToCheckForConnection(connection.socket);
			});
		}, SocketConnectionManager.HEART_BEAT_TIME_DIFF);
	}

	registerConnection(connection: WebSocket) {
		if (this.connections.size >= commonConfig.MAX_CONNECTIONS)
			throw new Error("Reached max connection limit for server");

		const connectionId = uuid();

		this.connections.set(connectionId, {
			socket: connection,
			isAlive: true,
		});

		connection.on("pong", () => {
			// Connection got a response back
			const status = this.connections.get(connectionId);

			if (status) status.isAlive = true;
		});

		return;
	}

	_destruct() {
		if (this.heartBeatRegisteredInterval)
			this.heartBeatRegisteredInterval = clearInterval(
				this.heartBeatRegisteredInterval
			);

		const connectionsStillOpen = Array.from(this.connections.values());

		for (const { socket } of connectionsStillOpen)
			try {
				socket.terminate();
			} catch {
				//
			}

		this.connections.clear();
	}
}

export default new SocketConnectionManager();
