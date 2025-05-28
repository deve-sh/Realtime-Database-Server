export type JSONPrimitive = string | number | boolean | null;

export type JSONValue = JSONPrimitive | JSONObject | JSONValue[];

export type JSONObject = {
	[key: string]: JSONValue;
};

export default interface DataStorageLayer {
	get(path: string): Promise<JSONValue | undefined>;
	set(path: string, value: JSONValue): Promise<void>;
	delete(path: string): Promise<void>;
}
