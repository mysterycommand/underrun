module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    'source/**/*.ts',
    '!source/**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    '^.+\\.s?css$': 'identity-obj-proxy',
  },
  testMatch: ['<rootDir>/source/**/?(*.)test?(s).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
};
