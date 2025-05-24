const config = () => {
	return {
		WS_PORT: Number(process.env.WS_PORT) || 8080,
		MAX_CONNECTIONS: Number(process.env.MAX_CONNECTIONS) || 200,
	};
};

export default config();
