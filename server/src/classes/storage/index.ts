import InMemoryTree from "./InMemoryTree";
import DataStorageLayer, { JSONValue } from "./interface";

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

	set(path: string, value: JSONValue) {
		return this.layer.set(path, value);
	}

	delete(path: string) {
		return this.layer.delete(path);
	}
}

export default new DataStorage();
