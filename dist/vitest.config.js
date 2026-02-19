"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("vitest/config");
const node_path_1 = require("node:path");
const rootDir = (0, node_path_1.resolve)(process.cwd(), "src");
const testsDir = (0, node_path_1.resolve)(process.cwd(), "tests");
exports.default = (0, config_1.defineConfig)({
    resolve: {
        alias: [
            { find: "@/tests", replacement: testsDir },
            { find: "@", replacement: rootDir },
        ],
    },
    test: {
        clearMocks: true,
        coverage: {
            enabled: true,
            exclude: ["src/**/*.spec.ts", "src/**/*.test.ts", "**/*.d.ts", "dist/**", "src/common/domain/errors/**"],
            include: ["src/**/domain/**/*.ts", "src/**/application/**/*.ts", "tests/**/*.ts"],
            provider: "v8",
            reporter: ["text"],
            reportsDirectory: "./coverage",
        },
        environment: "node",
        globals: true,
    },
});
//# sourceMappingURL=vitest.config.js.map