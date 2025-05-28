import DataStorageLayer, { JSONObject, JSONValue } from "./interface";

class InMemoryTree implements DataStorageLayer {
	private data: JSONObject;

	constructor(initialData: JSONObject = {}) {
		this.data = initialData;
	}

	async get(path: string) {
		const keys = this.parsePath(path);
		return this.getRecursive(this.data, keys);
	}

	async set(path: string, value: JSONValue) {
		const keys = this.parsePath(path);
		this.setRecursive(this.data, keys, value);
	}

	async delete(path: string) {
		const keys = this.parsePath(path);
		this.deleteRecursive(this.data, keys);
	}

	getTree(): JSONObject {
		return this.data;
	}

	private parsePath(path: string): string[] {
		return path.split("/").filter(Boolean);
	}

	private getRecursive(obj: JSONValue, keys: string[]): JSONValue | undefined {
		if (keys.length === 0) return obj;

		const [key, ...rest] = keys;

		if (
			typeof obj === "object" &&
			obj !== null &&
			!Array.isArray(obj) &&
			key in obj
		) {
			return this.getRecursive(obj[key], rest);
		}

		return undefined;
	}

	private setRecursive(
		obj: JSONObject,
		keys: string[],
		value: JSONValue
	): void {
		const [key, ...rest] = keys;

		if (rest.length === 0) {
			obj[key] = value;
		} else {
			if (
				!(key in obj) ||
				typeof obj[key] !== "object" ||
				obj[key] === null ||
				Array.isArray(obj[key])
			) {
				obj[key] = {};
			}

			this.setRecursive(obj[key] as JSONObject, rest, value);
		}
	}

	private deleteRecursive(obj: JSONObject, keys: string[]): void {
		const [key, ...rest] = keys;

		if (!(key in obj)) return;

		if (rest.length === 0) {
			delete obj[key];
		} else {
			const child = obj[key];
			if (
				typeof child === "object" &&
				child !== null &&
				!Array.isArray(child)
			) {
				this.deleteRecursive(child, rest);
			}
		}
	}
}

export default new InMemoryTree({});
