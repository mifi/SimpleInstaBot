const Store = require('electron-store');

const defaults = {
  skipPrivate: true,
  currentUsername: undefined,
  usersToFollowFollowersOf: ['@lostleblanc', '@samkolder', '@bomkanari'],

  maxFollowsPerHour: 20,
  maxFollowsPerDay: 150,
  maxLikesPerDay: 50,
  enableFollowUnfollow: true,
  maxLikesPerUser: 2,
  followUserRatioMin: 0.2,
  followUserRatioMax: 4.0,
  followUserMaxFollowers: null,
  followUserMaxFollowing: null,
  followUserMinFollowers: null,
  followUserMinFollowing: 10,
  dontUnfollowUntilDaysElapsed: 5,
  runAtHour: 10,
};

const store = new Store({
  defaults,
});

module.exports = { store, defaults };
