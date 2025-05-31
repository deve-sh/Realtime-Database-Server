import SecurityRulesManager from "../security-rules.ts";

import { setServerEnv } from "../../config/env.ts";

type TEST_MODE_UPDATE_ENV_VARIABLE = {
	type: "test_mode_set_env_variable";
	data: { key: string; value: string | boolean | number };
};

export type TEST_MODE_MESSAGES_FROM_CLIENT = TEST_MODE_UPDATE_ENV_VARIABLE;

class DevAndTestModeManager {
	constructor() {}

	handleTestModeOperation(message: TEST_MODE_MESSAGES_FROM_CLIENT) {
		if (message.type === "test_mode_set_env_variable") {
			setServerEnv(message.data.key, message.data.value);

			if (message.data.key === "SECURITY_RULES") SecurityRulesManager.resync();
		}
	}
}

export default new DevAndTestModeManager();
