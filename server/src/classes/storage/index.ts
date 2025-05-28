import InMemoryTree from "./InMemoryTree";
import DataStorageLayer, { JSONValue } from "./interface";

import SocketConnectionsManager from "../connections";

class DataStorage implements DataStorageLayer {
	layer: typeof InMemoryTree;

	constructor() {
		switch (process.env.STORAGE_LAYER) {
			case "in-memory":
			default: {
				this.layer = InMemoryTree;
				break;
			}
		}
	}

	get(path: string) {
		return this.layer.get(path);
	}

	async set(path: string, value: JSONValue) {
		try {
			const result = await this.layer.set(path, value);

			const updatedValueForPath = await this.get(path);

			// Propagate changes to listeners of this and its parent paths
			SocketConnectionsManager.getConnectionsSubscribedToPath(path).forEach(
				(socket) => {
					socket.sendMessageToClient({
						type: "value_updated",
						path,
						value: updatedValueForPath,
					});
				}
			);
			return result;
		} catch (error) {
			//
		}
	}

	async delete(path: string) {
		try {
			const result = await this.layer.delete(path);

			// Propagate changes to listeners of this and its parent paths
			SocketConnectionsManager.getConnectionsSubscribedToPath(path).forEach(
				(socket) => socket.sendMessageToClient({ type: "value_deleted", path })
			);

			return result;
		} catch (error) {
			//
		}
	}
}

export default new DataStorage();
