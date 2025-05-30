import { getServerEnv } from "./env.ts";

const config = () => {
	return {
		WS_PORT: Number(getServerEnv("WS_PORT")) || 8080,
		MAX_CONNECTIONS: Number(getServerEnv("MAX_CONNECTIONS")) || 200,
	};
};

export default config();
