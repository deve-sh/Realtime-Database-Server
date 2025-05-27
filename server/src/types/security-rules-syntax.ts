export type RuleValue = boolean | string;

export type RuleNode =
	| {
			".read"?: RuleValue;
			".write"?: RuleValue;
	  }
	| {
			[key: string]: RuleNode | undefined;
	  };

export type SECURITY_RULES_SYNTAX = {
	rules: {
		[key: string]: RuleNode;
	};
};

export default SECURITY_RULES_SYNTAX;
