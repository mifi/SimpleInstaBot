const preloadConfig = JSON.parse(new URL(window.location).searchParams.get('data'));

window.isDev = preloadConfig.isDev;
