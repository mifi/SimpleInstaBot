module.exports = {
  extends: ['mifi'],
  env: {
    browser: true, // puppeteer
  },
  rules: {
    'import/no-extraneous-dependencies': ['error', {
      devDependencies: true,
      optionalDependencies: false,
    }],
    'no-console': 0,
    'jsx-a11y/click-events-have-key-events': 0,
  },
};
