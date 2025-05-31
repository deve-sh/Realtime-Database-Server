import type { SOCKET_MESSAGE_FROM_CLIENT } from "../types/message.ts";
import type { TEST_MODE_MESSAGES_FROM_CLIENT } from "../classes/dev-and-test-mode/index.ts";

export const validateMessageFromClient = (
	message: SOCKET_MESSAGE_FROM_CLIENT | TEST_MODE_MESSAGES_FROM_CLIENT
) => {
	let isValid = true,
		error = null;

	if (process.env.NODE_ENV !== "production")
		if (message.type.startsWith("test_mode_")) return { isValid, error };

	if (!(message as SOCKET_MESSAGE_FROM_CLIENT).message_id) {
		isValid = false;
		error = "message_id parameter not provided for replying to";
		return { isValid, error };
	}

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
