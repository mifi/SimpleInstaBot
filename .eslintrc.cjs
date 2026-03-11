module.exports = {
  extends: ['mifi'],

  overrides: [
    {
      files: ['packages/simpleinstabot/**/*.{js,mjs,cjs,mjs,jsx,ts,mts,tsx}'],
      rules: {
        'import/no-extraneous-dependencies': ['error', {
          devDependencies: true,
          optionalDependencies: false,
        }],
        'no-console': 0,
        'jsx-a11y/click-events-have-key-events': 0,
      },
    },
    {
      files: ['packages/simpleinstabot/src/{renderer,preload}/**/*.{js,mjs,cjs,mjs,jsx,ts,mts,tsx}'],
      env: {
        node: false,
        browser: true,
      },
    },
    {
      files: ['packages/instauto/src/renderer/**/*.{js,mjs,cjs,mjs,jsx,ts,mts,tsx}'],
      env: {
        browser: true,
      },
    },
  ],
};
