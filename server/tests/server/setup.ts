import { server } from "../server";

export default async function globalSetup() {
	// Store the server instance globally (Node global)
	(globalThis as any).__server = server;
}

export function teardown() {
	(globalThis as any).__server.close();
}
