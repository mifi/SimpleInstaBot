const Store = require('electron-store');

const store = new Store({
  defaults: {
    skipPrivate: true,
    usersToFollowFollowersOf: ['@lostleblanc', '@samkolder', '@bomkanari'],

    maxFollowsPerHour: 20,
    maxFollowsPerDay: 150,
    followUserRatioMin: 0.2,
    followUserRatioMax: 4.0,
    followUserMaxFollowers: null,
    followUserMaxFollowing: null,
    followUserMinFollowers: null,
    followUserMinFollowing: null,
    dontUnfollowUntilDaysElapsed: 5,
    maxFollowsPerUser: 10,
    runAtHour: 10,
  }
});

module.exports = store;
