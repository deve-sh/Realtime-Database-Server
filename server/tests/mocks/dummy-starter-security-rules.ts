const dummyStarterSecurityRules = {
	rules: {
		users: {
			$uid: {
				".read": true,
				".write": true,
			},
		},
	},
};

export default dummyStarterSecurityRules;
