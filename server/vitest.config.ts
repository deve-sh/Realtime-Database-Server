import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		poolOptions: {
			threads: {
				singleThread: true,
				isolate: false,
			},
		},
		isolate: false,
		pool: "threads",
	},
});
