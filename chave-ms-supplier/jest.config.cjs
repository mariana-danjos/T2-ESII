module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/index.ts',
    '!src/docs/**',
    '!src/**/__tests__/**',
    '!src/db/pool.ts',
    '!src/messaging/snsPublisher.ts',
  ],
  coverageThreshold: {
    global: { branches: 50, functions: 50, lines: 60, statements: 60 },
  },
};
