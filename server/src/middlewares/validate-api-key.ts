// [STUB] Add your own API Key or Auth header validation mechanism
const validateApiKey = async (header: string) => {
	if (!header) return false;

	return true;
};

export default validateApiKey;
