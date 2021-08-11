module.exports = {
  "testEnvironment": "node",
  "transform": {
    "^.+\\.(ts)?$": "ts-jest"
  },
  testRegex: "(/test/.*|(\\.|/)(spec.jest))\\.(js?|ts?)$",
  collectCoverageFrom: [ 'lib/**/*.ts' ],
  coverageReporters: ['text-summary', 'html'],
  moduleFileExtensions: [
    "ts",
    "js",
    "json"
  ]
};
