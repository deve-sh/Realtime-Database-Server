type JSONPrimitive = string | number | boolean | null;

type JSONValue = JSONPrimitive | JSONObject | JSONValue[];

type JSONObject = {
	[key: string]: JSONValue;
};

interface DataStorageLayer {
	get(path: string): Promise<JSONValue | undefined>;
	set(path: string, value: JSONValue): Promise<void>;
	delete(path: string): Promise<void>;
}

export type { DataStorageLayer, JSONObject, JSONValue, JSONPrimitive };
