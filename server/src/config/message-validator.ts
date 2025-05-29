import type { SOCKET_MESSAGE_FROM_CLIENT } from "../types/message.ts";

export const validateMessageFromClient = (
	message: SOCKET_MESSAGE_FROM_CLIENT
) => {
	let isValid = true,
		error = null;

	switch (message.type) {
		case "action_on_disconnect": {
			if (!message.action || !message.action.dataPath) {
				isValid = false;
				error = "Invalid dataPath or action for detach action";
			}
			break;
		}
		case "create_data": {
			if (!message.dataPath || !message.data) {
				isValid = false;
				error = "Invalid dataPath or data for create action";
			}
			break;
		}
		case "update_data": {
			if (!message.dataPath || !message.updates) {
				isValid = false;
				error = "Invalid dataPath or updates for update action";
			}
			break;
		}
		case "delete_data": {
			if (!message.dataPath) {
				isValid = false;
				error = "Invalid dataPath for delete action";
			}
			break;
		}
		case "subscribe": {
			if (!message.dataPath) {
				isValid = false;
				error = "Invalid dataPath for delete action";
			}
			break;
		}
		case "unsubscribe": {
			if (!message.dataPath) {
				isValid = false;
				error = "Invalid dataPath for delete action";
			}
			break;
		}
		default: {
			isValid = false;
			error = "Invalid message type";
			break;
		}
	}

	return { isValid, error };
};
