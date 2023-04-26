// eslint-disable-next-line import/no-anonymous-default-export
export default {
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.ts"],
  testEnvironment: "jsdom",
  coverageProvider: "v8",

  transform: {
    "^.+\\.(t|j|mj)s?$": "@swc/jest",
  },

  transformIgnorePatterns: [],
};
