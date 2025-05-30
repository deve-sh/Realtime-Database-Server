import type {
	SECURITY_RULES_SYNTAX,
	RuleNode,
} from "../types/security-rules-syntax.ts";

import { getServerEnv } from "../config/env.ts";

import type { SUBSCRIBE_TO_DATA, WRITE_DATA } from "../types/message.ts";

type Operation = {
	action: WRITE_DATA | SUBSCRIBE_TO_DATA;
	// Things like uid, email etc that can be used to write expressions for evaluating access to read and write to a resource
	// Passed down by the controller responsible for reading and writing data from a request
	authContext: Record<string, any> | null;
};

class SecurityRulesManager {
	rules: SECURITY_RULES_SYNTAX = { rules: {} };

	constructor() {
		if (getServerEnv("SECURITY_RULES_TO_INIT")) {
			this.rules = JSON.parse(
				getServerEnv("SECURITY_RULES_TO_INIT").toString()
			) as SECURITY_RULES_SYNTAX;
		}
	}

	private resync() {
		// TODO: Add logic to fetch a set of security rules from a database that the customer will write to
	}

	private matchRulePath(
		segments: string[],
		pathContext: Record<string, string>
	): RuleNode | null {
		let node: any = this.rules["rules"];

		for (const segment of segments) {
			if (typeof node !== "object") return null;

			if (segment in node) {
				node = node[segment];
			} else {
				const dynamicKey = Object.keys(node).find((k) => k.startsWith("$"));
				if (!dynamicKey) return null;

				pathContext[dynamicKey] = segment;
				node = node[dynamicKey];
			}
		}

		return typeof node === "object" ? node : null;
	}

	private evaluateJSExpression(
		expression: string,
		pathContext: Record<string, string>,
		authContext: Record<string, string | number> | null
	) {
		let jsExpr = expression;

		for (const [key, value] of Object.entries(pathContext)) {
			jsExpr = jsExpr.replaceAll(
				key,
				typeof value !== "string" ? JSON.stringify(value) : value
			);
		}

		try {
			const funcForEvaluation = new Function(
				`
                const auth = ${
									authContext ? JSON.stringify(authContext) : "{}"
								};
                return ${jsExpr}
                `
			);

			const result = funcForEvaluation();

			return result;
		} catch {
			return false;
		}
	}

	isOperationAllowed(op: Operation) {
		const segments = op.action.dataPath.split("/").filter(Boolean);

		const isRead = ["subscribe"].includes(op.action.type);

		const pathContext = {};

		const ruleNode = this.matchRulePath(segments, pathContext);

		if (!ruleNode || typeof ruleNode !== "object") return false;

		const correspondingRuleKey = isRead ? ".read" : ".write";
		const permission = ruleNode[correspondingRuleKey];

		if (permission === true) return true;
		if (permission === false || permission == null) return false;

		return this.evaluateJSExpression(
			permission as string,
			pathContext,
			op.authContext
		);
	}
}

export default new SecurityRulesManager();

/**
rules = {
    rules: {
        users: {
            $uid: {
                ".read": true,
                ".write": "$uid === 123",
            },
        },
    }
}

srManager = new SecurityRulesManager();

srManager.isOperationAllowed({ action: { type: 'subscribe', dataPath: '/users/uid' }}) // true
srManager.isOperationAllowed({ action: { type: 'create_data', dataPath: '/users/abc' }})    // false
srManager.isOperationAllowed({ action: { type: 'create_data', dataPath: '/users/123' }})    // true
*/
