export type SUBSCRIBE_TO_DATA = {
	type: "subscribe";
	dataPath: string;
};

export type UNSUBSCRIBE_TO_DATA = {
	type: "unsubscribe";
	dataPath: string;
};

export type CREATE_DATA = {
	type: "create_data";
	dataPath: string;
	data: string | null | Number | Record<string, any>;
};

export type UPDATE_DATA = {
	type: "update_data";
	dataPath: string;
	updates: string | null | Number | Record<string, any>;
};

export type DELETE_DATA = {
	type: "delete_data";
	dataPath: string;
};

export type WRITE_DATA = CREATE_DATA | UPDATE_DATA | DELETE_DATA;

export type SET_DISCONNECTION_HANDLER = {
	type: "action_on_disconnect";
	dataPath: string;
	action: "remove" | "update";
	updates?: string | null | Number | Record<string, any>;
};
