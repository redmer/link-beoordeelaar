/** @type {import("jest").Config} */
export default {
  preset: "ts-jest/presets/js-with-ts-esm",
  testEnvironment: "jsdom",
  extensionsToTreatAsEsm: [".ts", ".tsx", ".jsx"],

  transform: {
    "^.+\\.[tj]sx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          allowJs: true,
          checkJs: false,
        },
      },
    ],
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.jsx?$": "$1",
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(preact|@preact|@testing-library)/)",
  ],
};
