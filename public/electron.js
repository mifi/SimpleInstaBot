const { app, BrowserWindow } = require('electron'); // eslint-disable-line import/no-extraneous-dependencies
const isDev = require('electron-is-dev');
const path = require('path');
const pie = require('puppeteer-in-electron');
const puppeteer = require('puppeteer-core');
const { join } = require('path');
const assert = require('assert');
const fs = require('fs-extra');

const Instauto = require('instauto');
const moment = require('moment');


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

let pieBrowser;
let instautoDb;
let instauto;
let instautoWindow;
let logger = console;

async function initPieBrowser() {
  // Must be called before electron is ready
  pieBrowser = await pie.connect(app, puppeteer);
}

initPieBrowser().catch(console.error);

function getFilePath(rel) {
  return join(app.getPath('userData'), rel);
}

function getCookiesPath() {
  return getFilePath('cookies.json');
}

async function checkHaveCookies() {
  return fs.exists(getCookiesPath());
}

async function deleteCookies() {
  try {
    await fs.unlink(getCookiesPath());
  } catch (err) {
    logger.warn('Unable to delete cookies', err);
  }
}

async function initInstautoDb() {
  instautoDb = await Instauto.JSONDB({
    followedDbPath: getFilePath('followed.json'),
    unfollowedDbPath: getFilePath('unfollowed.json'),
    likedPhotosDbPath: getFilePath('liked-photos.json'),
  });
}

function getInstautoData() {
  const dayMs = 24 * 60 * 60 * 1000;

  return {
    numTotalFollowedUsers: instautoDb.getTotalFollowedUsers(),
    numTotalUnfollowedUsers: instautoDb.getTotalUnfollowedUsers(),
    numFollowedLastDay: instautoDb.getFollowedLastTimeUnit(dayMs).length,
    numUnfollowedLastDay: instautoDb.getUnfollowedLastTimeUnit(dayMs).length,
    numTotalLikedPhotos: instautoDb.getTotalLikedPhotos(),
    numLikedLastDay: instautoDb.getLikedPhotosLastTimeUnit(dayMs).length,
  };
}

async function initInstauto({
  username,
  password,
  dontUnfollowUntilDaysElapsed,
  maxFollowsPerHour,
  maxFollowsPerDay,
  maxLikesPerDay,
  followUserRatioMin,
  followUserRatioMax,
  followUserMaxFollowers,
  followUserMaxFollowing,
  followUserMinFollowers,
  followUserMinFollowing,
  excludeUsers,
  dryRun,
  logger: loggerArg,
}) {
  instautoWindow = new BrowserWindow({
    x: 0,
    y: 0,
    webPreferences: {
      partition: 'instauto', // So that we have a separate session
    },
  });

  const { session } = instautoWindow.webContents;
  await session.clearStorageData(); // we store cookies etc separately

  const b = { // TODO improve API in instauto to accept page instead of browser?
    newPage: async () => pie.getPage(pieBrowser, instautoWindow),
  };

  const options = {
    // Testing
    // randomizeUserAgent: false,
    // userAgent: 'Mozilla/5.0 (Linux; Android 9; RMX1971) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.136 Mobile Safari/537.36',

    cookiesPath: getCookiesPath(),

    username,
    password,

    maxFollowsPerHour,
    maxFollowsPerDay,
    maxLikesPerDay,
    followUserRatioMin,
    followUserRatioMax,
    followUserMaxFollowers,
    followUserMaxFollowing,
    followUserMinFollowers,
    followUserMinFollowing,
    dontUnfollowUntilTimeElapsed: dontUnfollowUntilDaysElapsed * 24 * 60 * 60 * 1000,
    excludeUsers,
    dryRun,

    logger: loggerArg,
  };

  mainWindow.focus();

  instauto = await Instauto(instautoDb, b, options);
  logger = loggerArg;
}

function cleanupInstauto() {
  instautoWindow.destroy();
  // TODO deinit more?
  // instautoDb = undefined;
  instauto = undefined;
  logger = undefined;
}

async function runBot({
  usernames, ageInDays, skipPrivate, runAtHour, maxLikesPerUser, maxFollowsTotal,
}) {
  assert(instauto);

  function getMsUntilNextRun() {
    // const now = moment('2018-08-26T13:00:00+02:00');
    const now = moment();
    const isAfterHour = now.hour() >= runAtHour;
    const nextRunTime = now.clone().startOf('day').add(runAtHour, 'hours');
    if (isAfterHour) nextRunTime.add(1, 'day');
    return (1 + ((Math.random() - 0.5) * 0.1)) * nextRunTime.diff(now);
  }

  async function sleepUntilNextDay() {
    const msUntilNextRun = getMsUntilNextRun();
    logger.log(`Sleeping ${msUntilNextRun / (60 * 60 * 1000)} hours...`);
    await new Promise(resolve => setTimeout(resolve, msUntilNextRun));
    logger.log('Done sleeping, running...');
  }

  for (;;) {
    try {
      // Leave room for some follows too
      const unfollowLimit = Math.floor(maxFollowsTotal / 3);
      const unfollowedCount = await instauto.unfollowOldFollowed({ ageInDays, limit: unfollowLimit });

      if (unfollowedCount > 0) await instauto.sleep(10 * 60 * 1000);
      const likingEnabled = maxLikesPerUser != null && maxLikesPerUser >= 1;

      await instauto.followUsersFollowers({
        usersToFollowFollowersOf: usernames,
        maxFollowsTotal: maxFollowsTotal - unfollowedCount,
        skipPrivate,
        enableLikeImages: likingEnabled,
        likeImagesMax: likingEnabled ? maxLikesPerUser : undefined,
      });

      logger.log('Done running');

      await instauto.sleep(30000);
    } catch (err) {
      logger.error(err);
    }

    await sleepUntilNextDay();
  }
}


function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      // https://github.com/electron/electron/issues/5107
      webSecurity: !isDev,
    },
  });

  mainWindow.loadURL(isDev ? 'http://localhost:3001' : `file://${path.join(__dirname, '../build/index.html')}`);

  if (isDev) {
    const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer'); // eslint-disable-line global-require,import/no-extraneous-dependencies

    installExtension(REACT_DEVELOPER_TOOLS)
      .then(name => console.log(`Added Extension: ${name}`))
      .catch(err => console.log('An error occurred: ', err));
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

module.exports = {
  initInstauto,
  initInstautoDb,
  getInstautoData,
  runBot,
  cleanupInstauto,
  checkHaveCookies,
  deleteCookies,
};
