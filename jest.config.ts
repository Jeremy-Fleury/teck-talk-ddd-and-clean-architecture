import type { Config } from "jest";

const config: Config = {
	preset: "ts-jest",
	testEnvironment: "node",
	roots: ["<rootDir>/src"],
	testMatch: ["**/*.spec.ts"],
	moduleFileExtensions: ["ts", "js", "json"],
	collectCoverageFrom: ["src/**/*.ts", "!src/**/*.spec.ts", "!src/**/index.ts"],
	coverageDirectory: "coverage",
	verbose: true,
	transform: {
		"^.+\\.ts$": "ts-jest",
		"^.+\\.js$": ["babel-jest", { presets: [["@babel/preset-env", { targets: { node: "current" } }]] }],
	},
	transformIgnorePatterns: ["node_modules/(?!uuid)"],
};

export default config;
