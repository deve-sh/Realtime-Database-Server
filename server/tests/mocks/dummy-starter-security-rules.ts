const mockStarterSecurityRules = {
	rules: {
		users: {
			$uid: {
				".read": true,
				".write": true,
			},
		},
	},
};

export default mockStarterSecurityRules;
