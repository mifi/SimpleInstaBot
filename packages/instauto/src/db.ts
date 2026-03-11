import { readFile, writeFile } from 'node:fs/promises';
import keyBy from 'lodash/keyBy.js';

export interface FollowedUser { username: string; time: number; failed?: boolean; noActionTaken?: boolean }
export interface LikedPhoto { username: string; href: string; time: number }

export default async function JSONDB({
  followedDbPath,
  unfollowedDbPath,
  likedPhotosDbPath,

  logger = console,
}: {
  followedDbPath: string;
  unfollowedDbPath: string;
  likedPhotosDbPath: string;
  logger?: Console;
}) {
  let prevFollowedUsers: Record<string, FollowedUser> = {};
  let prevUnfollowedUsers: Record<string, FollowedUser> = {};
  let prevLikedPhotos: LikedPhoto[] = [];

  async function trySaveDb() {
    try {
      await writeFile(followedDbPath, JSON.stringify(Object.values(prevFollowedUsers)));
      await writeFile(unfollowedDbPath, JSON.stringify(Object.values(prevUnfollowedUsers)));
      await writeFile(likedPhotosDbPath, JSON.stringify(prevLikedPhotos));
    } catch {
      logger.error('Failed to save database');
    }
  }

  async function tryLoadDb() {
    try {
      prevFollowedUsers = keyBy(JSON.parse(await readFile(followedDbPath, 'utf8')), 'username');
    } catch {
      logger.warn('No followed database found');
    }
    try {
      prevUnfollowedUsers = keyBy(JSON.parse(await readFile(unfollowedDbPath, 'utf8')), 'username');
    } catch {
      logger.warn('No unfollowed database found');
    }
    try {
      prevLikedPhotos = JSON.parse(await readFile(likedPhotosDbPath, 'utf8'));
    } catch {
      logger.warn('No likes database found');
    }
  }

  function getPrevLikedPhotos() {
    return prevLikedPhotos;
  }

  function getTotalLikedPhotos() {
    return getPrevLikedPhotos().length; // TODO performance
  }

  function getLikedPhotosLastTimeUnit(timeUnit: number) {
    const now = Date.now();
    return getPrevLikedPhotos().filter((u) => now - u.time < timeUnit);
  }

  async function addLikedPhoto({ username, href, time }: LikedPhoto) {
    prevLikedPhotos.push({ username, href, time });
    await trySaveDb();
  }

  function getPrevFollowedUsers() {
    return Object.values(prevFollowedUsers);
  }

  function getTotalFollowedUsers() {
    return getPrevFollowedUsers().length; // TODO performance
  }

  function getFollowedLastTimeUnit(timeUnit: number) {
    const now = Date.now();
    return getPrevFollowedUsers().filter((u) => now - u.time < timeUnit);
  }

  function getPrevFollowedUser(username: string) {
    return prevFollowedUsers[username];
  }

  async function addPrevFollowedUser(user: FollowedUser) {
    prevFollowedUsers[user.username] = user;
    await trySaveDb();
  }

  function getPrevUnfollowedUsers() {
    return Object.values(prevUnfollowedUsers);
  }

  function getTotalUnfollowedUsers() {
    return getPrevUnfollowedUsers().length; // TODO performance
  }

  function getUnfollowedLastTimeUnit(timeUnit: number) {
    const now = Date.now();
    return getPrevUnfollowedUsers().filter((u) => now - u.time < timeUnit);
  }

  async function addPrevUnfollowedUser(user: FollowedUser) {
    prevUnfollowedUsers[user.username] = user;
    await trySaveDb();
  }

  await tryLoadDb();

  return {
    save: trySaveDb,
    addPrevFollowedUser,
    getPrevFollowedUser,
    addPrevUnfollowedUser,
    getPrevFollowedUsers,
    getFollowedLastTimeUnit,
    getPrevUnfollowedUsers,
    getUnfollowedLastTimeUnit,
    getPrevLikedPhotos,
    getLikedPhotosLastTimeUnit,
    addLikedPhoto,
    getTotalFollowedUsers,
    getTotalUnfollowedUsers,
    getTotalLikedPhotos,
  };
}

export type JSONDBInstance = Awaited<ReturnType<typeof JSONDB>>;
