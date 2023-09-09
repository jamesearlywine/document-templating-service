import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  modulePathIgnorePatterns: ["./aws-sam", "./cdk", "./node_modules"],
  clearMocks: true,
  collectCoverage: true,
  coverageReporters: ["lcov", "text-summary"],
  moduleDirectories: ["node_modules", "src"],
  testTimeout: 180000
};

export default config;