import { describe, expect, test } from "vitest";

import { SERVER_HTTP_URL } from "./server/config";

describe.sequential("Server should start up and acknowledge requests correctly", async () => {
	test.sequential("Server start up and expected response", async () => {
		const response = await fetch(SERVER_HTTP_URL);
		expect(await response.text()).toMatch(/upgrade required/i);
	});
});
