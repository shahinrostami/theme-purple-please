module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: false, // Enabled by running `yarn run test:coverage`
  collectCoverageFrom: [ 'src/**/*.ts' ],
  coverageReporters: ['text-summary', 'html'],
  testPathIgnorePatterns: ['/lib/', '/node_modules/'],
};
