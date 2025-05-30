const envVariables: Record<string, string | number | boolean> = {};

export const getServerEnv = (key: string) => {
	return process.env[key] ?? envVariables[key] ?? null;
};

export const setServerEnv = (
	key: string,
	val: (typeof envVariables)[keyof typeof envVariables]
) => {
	envVariables[key] = val;
};
