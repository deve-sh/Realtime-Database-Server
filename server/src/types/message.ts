export type SET_AUTH_CONTEXT_FOR_CONNECTION = {
	type: "set_auth_context";
	token: string;
};

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
	action: UPDATE_DATA | DELETE_DATA;
};

export type SOCKET_MESSAGE_FROM_CLIENT = { message_id: string } & (
	| SET_AUTH_CONTEXT_FOR_CONNECTION
	| SUBSCRIBE_TO_DATA
	| UNSUBSCRIBE_TO_DATA
	| WRITE_DATA
	| SET_DISCONNECTION_HANDLER
);
