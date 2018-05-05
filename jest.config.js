module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  moduleNameMapper: {
    '^@/(.*)': '<rootDir>/src'
  },
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.ts$': '<rootDir>/node_modules/ts-jest/preprocessor.js',
  },
  testMatch: ['**/?(*.)(spec|test).ts'],
  testEnvironment: 'node'
}
