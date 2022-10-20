module.exports = {
  roots: ['<rootDir>/lib'],
  testMatch: ['**/*.spec.js'],
  coverageReporters: [['lcov', { projectRoot: '../' }], 'text']
};
