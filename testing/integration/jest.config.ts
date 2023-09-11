import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  rootDir: "../../",
  testMatch: ["<rootDir>/testing/integration/**/*.test.ts"],
  preset: "ts-jest",
  testEnvironment: "node",
  clearMocks: true,
  collectCoverage: true,
  coverageReporters: ["lcov", "text-summary"],
  moduleDirectories: ["node_modules", "src"],
  testTimeout: 180000,
};

export default config;
