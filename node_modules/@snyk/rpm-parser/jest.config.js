module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  collectCoverageFrom: [ 'lib/**/*.ts' ],
  coverageReporters: ['text-summary', 'html'],
  testPathIgnorePatterns: ['/node_modules/'],
};
