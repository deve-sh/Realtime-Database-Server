export default async function validateAuthToken(
	token: string
): Promise<Record<string, string | number> | null> {
	// [STUB] TODO: Add logic for validating JWT and returning an object if valid, `null` if not
	return { uid: "<hardcoded-uid>" };
}
