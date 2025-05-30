import type { WebSocket } from "ws";

import { getServerEnv } from "../config/env.ts";

import commonConfig from "../config/index.ts";

import RealtimeDatabaseClientSocket from "./realtime-database-client-socket.ts";

class SocketConnectionManager {
	static HEART_BEAT_TIME_DIFF =
		Number(getServerEnv("HEART_BEAT_TIME_DIFF")) || 15_000;

	private sockets = new Map<WebSocket, RealtimeDatabaseClientSocket>();

	private registeredHeartBeatInterval: NodeJS.Timeout | void;

	constructor() {
		this.registeredHeartBeatInterval = setInterval(
			this.hearbeatCheck,
			SocketConnectionManager.HEART_BEAT_TIME_DIFF
		);
	}

	registerConnection(connection: WebSocket) {
		if (this.sockets.size >= commonConfig.MAX_CONNECTIONS)
			throw new Error("Reached max connection limit for server");

		const realtimeDatabaseSocket = new RealtimeDatabaseClientSocket(connection);

		this.sockets.set(connection, realtimeDatabaseSocket);

		realtimeDatabaseSocket.pong(
			// Connection got a response back for pong
			() => (realtimeDatabaseSocket.isAlive = true)
		);

		return realtimeDatabaseSocket;
	}

	getConnectionsSubscribedToPath(path: string) {
		return Array.from(this.sockets.values()).filter((socket) =>
			socket.isListeningToPath(path)
		);
	}

	private closeSocket(connection: WebSocket) {
		const realtimeDatabaseSocket = this.sockets.get(connection);

		if (!realtimeDatabaseSocket) return;

		realtimeDatabaseSocket.terminateConnection();

		this.sockets.delete(connection);
	}

	private hearbeatCheck = () => {
		const connectionsAvailable = Array.from(this.sockets.keys());

		connectionsAvailable.forEach((connection) => {
			const realtimeDatabaseSocket = this.sockets.get(connection);

			if (!realtimeDatabaseSocket) return;

			if (!realtimeDatabaseSocket.isAlive) {
				// Response from client hasn't come back in the defined timeframe, terminate this connection and clean it up.
				return this.closeSocket(connection);
			}

			// Mark tje connection as not alive, and wait for 'pong' to come back from client to mark it as 'alive'.
			realtimeDatabaseSocket.isAlive = false;
			realtimeDatabaseSocket.ping();
		});
	};

	_destruct() {
		if (this.registeredHeartBeatInterval)
			this.registeredHeartBeatInterval = clearInterval(
				this.registeredHeartBeatInterval
			);

		const connectionsStillOpen = Array.from(this.sockets.keys());

		for (const connection of connectionsStillOpen)
			try {
				this.closeSocket(connection);
			} catch {
				//
			}

		this.sockets.clear();
	}
}

export default new SocketConnectionManager();
