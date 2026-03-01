// eslint-disable-next-line unicorn/prefer-global-this
const preloadConfig = JSON.parse(new URL(window.location).searchParams.get('data'));

globalThis.isDev = preloadConfig.isDev;
