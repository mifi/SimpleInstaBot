import React, { memo, useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, Tooltip, IconButton, Button, TextInputField, SideSheet, TagInput, Checkbox, Badge, Label, Textarea } from 'evergreen-ui';
import Swal from 'sweetalert2';
import moment from 'moment';
import isEqual from 'lodash/isEqual';
import Lottie from 'react-lottie-player';
import { FaRegSmileBeam } from 'react-icons/fa';
import withReactContent from 'sweetalert2-react-content';

import runningLottie from './14470-phone-running.json';
import robotLottie from './10178-c-bot.json';
import robotDizzyLottie from './13680-robot-call.json';
import loveLottie from './13682-heart.json';

const electron = window.require('electron');
const isDev = window.require('electron-is-dev');

const { powerSaveBlocker } = electron.remote.require('electron');
const { initInstautoDb, initInstauto, runBotNormalMode, runBotUnfollowAllUnknown, runBotUnfollowNonMutualFollowers, runBotUnfollowOldFollowed, runBotUnfollowUserList, runBotFollowUserList, cleanupInstauto, checkHaveCookies, deleteCookies, getInstautoData, runTestCode } = electron.remote.require('./electron');
const { store: configStore, defaults: configDefaults } = electron.remote.require('./store');

const ReactSwal = withReactContent(Swal);

const cleanupAccounts = (accounts) => accounts.map(user => user.replace(/^@/g, ''));


const StatisticsBanner = memo(({ data: { numFollowedLastDay, numTotalFollowedUsers, numUnfollowedLastDay, numTotalUnfollowedUsers, numLikedLastDay, numTotalLikedPhotos } }) => {
  const headingStyle = { marginBottom: 5, color: '#7c3c21' };
  const statStyle = { minWidth: 30, paddingRight: 5, fontWeight: 400, fontSize: 24, color: '#303960' };
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ margin: 20 }}>
        <div style={headingStyle}>Followed users</div>
        <div style={{ display: 'flex', alignItems: 'center' }}><div style={statStyle}>{numFollowedLastDay}</div>Last 24h</div>
        <div style={{ display: 'flex', alignItems: 'center' }}><div style={statStyle}>{numTotalFollowedUsers}</div>Total</div>
      </div>

      <div style={{ margin: 20 }}>
        <div style={headingStyle}>Unfollowed users</div>
        <div style={{ display: 'flex', alignItems: 'center' }}><div style={statStyle}>{numUnfollowedLastDay}</div>Last 24h</div>
        <div style={{ display: 'flex', alignItems: 'center' }}><div style={statStyle}>{numTotalUnfollowedUsers}</div>Total</div>
      </div>

      <div style={{ margin: 20 }}>
        <div style={headingStyle}>Liked photos</div>
        <div style={{ display: 'flex', alignItems: 'center' }}><div style={statStyle}>{numLikedLastDay}</div>Last 24h</div>
        <div style={{ display: 'flex', alignItems: 'center' }}><div style={statStyle}>{numTotalLikedPhotos}</div>Total</div>
      </div>
    </div>
  );
});

const AdvancedSettings = memo(({
  advancedSettings, onChange, dryRun, setDryRun, instantStart, setInstantStart,
}) => {
  const [advancedSettingsTxt, setAdvancedSettingsTxt] = useState();
  const [valid, setValid] = useState(true);

  function onTextareaChange(e) {
    try {
      const { value } = e.target;
      setAdvancedSettingsTxt(value);
      const parsed = JSON.parse(value);
      setValid(true);
      onChange(parsed);
      setAdvancedSettingsTxt();
    } catch (err) {
      setValid(false);
      console.error(err);
    }
  }

  const tooHighWarning = 'NOTE: setting this too high may cause Action Blocked';
  const optsData = {
    dontUnfollowUntilDaysElapsed: {
      description: 'Automatically unfollow auto-followed users after this number of days',
    },
    followUserMinFollowing: {
      description: 'Skip users who follow less users than this',
    },
    followUserMinFollowers: {
      description: 'Skip users who have less followers than this',
    },
    followUserMaxFollowers: {
      description: 'Skip users who have more followers than this',
    },
    followUserMaxFollowing: {
      description: 'Skip users who are following more than this',
    },
    followUserRatioMin: {
      description: 'Skip users that have a followers/following ratio lower than this',
    },
    followUserRatioMax: {
      description: 'Skip users that have a followers/following ratio higher than this',
    },
    maxFollowsPerHour: {
      description: `Limit follow and unfollow operations per hour. ${tooHighWarning}`,
    },
    maxFollowsPerDay: {
      description: `Limit follow and unfollow operations over 24 hours. ${tooHighWarning}`,
    },
    maxLikesPerUser: {
      description: 'Like up to this number of photos on each user\'s profile. Set to 0 to deactivate liking photos',
    },
    enableFollowUnfollow: {
      description: 'Enable follow/unfollow users? (can be disabled if you only want to like photos)',
    },
    maxLikesPerDay: {
      description: `Limit total photo likes per 24 hours. ${tooHighWarning}`,
    },
    runAtHour: {
      description: 'Repeat at this hour (24hr based) every day',
    },
  };

  const formatValue = (value) => (value != null ? String(value) : 'unset');

  return (
    <>
      <Lottie
        loop
        play
        animationData={robotDizzyLottie}
        style={{ width: 100, height: 100, margin: 0 }}
      />

      {Object.entries(advancedSettings).map(([key, value]) => {
        const defaultValue = configDefaults[key];
        const hasChanged = !isEqual(defaultValue, value);

        return (
          <div key={key} style={{ margin: '10px 0' }}>
            <b>{key}</b>
            &nbsp;
            <Badge color={value != null ? 'green' : undefined}>{formatValue(value)}</Badge>
            {hasChanged && (
              <>
                &nbsp;
                <Badge>default {formatValue(defaultValue)}</Badge>
              </>
            )}
            <div>{optsData[key].description}</div>
          </div>
        );
      })}

      <Label
        htmlFor="textarea"
        marginBottom={4}
        display="block"
      >
        Change settings here (JSON):
      </Label>
      <Textarea
        isInvalid={!valid}
        rows={10}
        id="textarea"
        onChange={onTextareaChange}
        value={advancedSettingsTxt != null ? advancedSettingsTxt : JSON.stringify(advancedSettings, null, 2)}
      />

      <div style={{ margin: '30px 0' }}>
        <Checkbox
          label="Dry run - If checked, the bot will not perform any real actions (useful for testing)"
          checked={dryRun}
          onChange={e => setDryRun(e.target.checked)}
        />

        <Checkbox
          label="Start immediately - If unchecked, the bot will sleep until the hour 'runAtHour' when Start button is pressed"
          checked={instantStart}
          onChange={e => setInstantStart(e.target.checked)}
        />
      </div>
    </>
  );
});

const LogView = memo(({ logs, style, fontSize } = {}) => {
  const logViewRef = useRef();
  useEffect(() => {
    if (logViewRef.current) logViewRef.current.scrollTop = logViewRef.current.scrollHeight;
  }, [logs]);

  return (
    <div ref={logViewRef} style={{ width: '100%', height: 100, overflowY: 'scroll', overflowX: 'hidden', textAlign: 'left', ...style }}>
      {logs.map(({ args, level, time }, i) => {
        const color = {
          warn: '#f37121',
          error: '#d92027',
        }[level] || 'rgba(0,0,0,0.6)';

        return (
          // eslint-disable-next-line react/no-array-index-key
          <div key={i}>
            <span style={{ marginRight: 5, whiteSpace: 'pre-wrap', fontSize }}>{moment(time).format('LT')}</span>
            <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize, color }}>
              {args.map(arg => String(arg)).join(' ')}
            </span>
          </div>
        );
      })}
    </div>
  );
});

const AccountsList = memo(({ hasWarning, accounts, setAccounts, label, placeholder, tooltip }) => {
  function onChange(newVal) {
    // Some people try hashtags
    setAccounts(newVal.filter((v) => !v.startsWith('#')));
  }

  return (
    <>
      <Label>
        {label}<br /><b>Press ENTER between each username</b>
      </Label>
      {tooltip && (
        <Tooltip content={tooltip}>
          <IconButton icon="help" appearance="minimal" />
        </Tooltip>
      )}
      <TagInput
        inputProps={{ placeholder }}
        style={{ border: hasWarning ? '1px solid orange' : undefined }}
        values={accounts}
        onChange={onChange}
        separator={/[,\s]/}
      />
    </>
  );
});

const AccountsListDialog = ({ isShown, onCloseComplete, onConfirm, label }) => {
  const [accounts, setAccounts] = useState([]);

  return (
    <Dialog confirmLabel={label} isShown={isShown} onCloseComplete={onCloseComplete} onConfirm={() => onConfirm(accounts)}>
      <AccountsList accounts={accounts} setAccounts={setAccounts} placeholder="@account1 @account2" />
    </Dialog>
  );
};

const App = memo(() => {
  const [advancedSettings, setAdvancedSettings] = useState({
    maxFollowsPerDay: configStore.get('maxFollowsPerDay'),
    maxFollowsPerHour: configStore.get('maxFollowsPerHour'),
    maxLikesPerDay: configStore.get('maxLikesPerDay'),
    maxLikesPerUser: configStore.get('maxLikesPerUser'),
    enableFollowUnfollow: configStore.get('enableFollowUnfollow'),
    followUserRatioMin: configStore.get('followUserRatioMin'),
    followUserRatioMax: configStore.get('followUserRatioMax'),
    followUserMaxFollowers: configStore.get('followUserMaxFollowers'),
    followUserMaxFollowing: configStore.get('followUserMaxFollowing'),
    followUserMinFollowers: configStore.get('followUserMinFollowers'),
    followUserMinFollowing: configStore.get('followUserMinFollowing'),
    dontUnfollowUntilDaysElapsed: configStore.get('dontUnfollowUntilDaysElapsed'),
    runAtHour: configStore.get('runAtHour'),
  });

  function setAdvancedSetting(key, value) {
    setAdvancedSettings(s => ({ ...s, [key]: value }));
  }

  useEffect(() => configStore.set('maxFollowsPerDay', advancedSettings.maxFollowsPerDay), [advancedSettings.maxFollowsPerDay]);
  useEffect(() => configStore.set('maxFollowsPerHour', advancedSettings.maxFollowsPerHour), [advancedSettings.maxFollowsPerHour]);
  useEffect(() => configStore.set('maxLikesPerDay', advancedSettings.maxLikesPerDay), [advancedSettings.maxLikesPerDay]);
  useEffect(() => configStore.set('maxLikesPerUser', advancedSettings.maxLikesPerUser), [advancedSettings.maxLikesPerUser]);
  useEffect(() => configStore.set('enableFollowUnfollow', advancedSettings.enableFollowUnfollow), [advancedSettings.enableFollowUnfollow]);
  useEffect(() => configStore.set('followUserRatioMin', advancedSettings.followUserRatioMin), [advancedSettings.followUserRatioMin]);
  useEffect(() => configStore.set('followUserRatioMax', advancedSettings.followUserRatioMax), [advancedSettings.followUserRatioMax]);
  useEffect(() => configStore.set('followUserMaxFollowers', advancedSettings.followUserMaxFollowers), [advancedSettings.followUserMaxFollowers]);
  useEffect(() => configStore.set('followUserMaxFollowing', advancedSettings.followUserMaxFollowing), [advancedSettings.followUserMaxFollowing]);
  useEffect(() => configStore.set('followUserMinFollowers', advancedSettings.followUserMinFollowers), [advancedSettings.followUserMinFollowers]);
  useEffect(() => configStore.set('followUserMinFollowing', advancedSettings.followUserMinFollowing), [advancedSettings.followUserMinFollowing]);
  useEffect(() => configStore.set('dontUnfollowUntilDaysElapsed', advancedSettings.dontUnfollowUntilDaysElapsed), [advancedSettings.dontUnfollowUntilDaysElapsed]);
  useEffect(() => configStore.set('runAtHour', advancedSettings.runAtHour), [advancedSettings.runAtHour]);

  const [haveCookies, setHaveCookies] = useState(false);
  const [dryRun, setDryRun] = useState(isDev);
  const [running, setRunning] = useState(false);
  const [advancedVisible, setAdvancedVisible] = useState(false);
  const [logsVisible, setLogsVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [skipPrivate, setSkipPrivate] = useState(configStore.get('skipPrivate'));
  const [usersToFollowFollowersOf, setUsersToFollowFollowersOf] = useState(configStore.get('usersToFollowFollowersOf'));

  const [currentUsername, setCurrentUsername] = useState(configStore.get('currentUsername'));
  useEffect(() => (currentUsername ? configStore.set('currentUsername', currentUsername) : configStore.delete('currentUsername')), [currentUsername]);

  const [instantStart, setInstantStart] = useState(true);

  // Testing
  // useEffect(() => isDev && setRunning(true), []);

  const [shouldPlayAnimations, setSouldPlayAnimations] = useState(true);

  const [unfollowUserListDialogShown, setUnfollowUserListDialogShown] = useState(false);
  const [followUserListDialogShown, setFollowUserListDialogShown] = useState(false);

  useEffect(() => {
    if (running) {
      const t = setTimeout(() => {
        setSouldPlayAnimations(false);
      }, isDev ? 5000 : 60000);

      return () => clearTimeout(t);
    }
    return undefined;
  }, [running]);

  const [logs, setLogs] = useState([]);

  const [instautoData, setInstautoData] = useState();

  useEffect(() => configStore.set('skipPrivate', skipPrivate), [skipPrivate]);
  useEffect(() => configStore.set('usersToFollowFollowersOf', usersToFollowFollowersOf), [usersToFollowFollowersOf]);

  const fewUsersToFollowFollowersOf = usersToFollowFollowersOf.length < 5;

  async function updateCookiesState() {
    setHaveCookies(await checkHaveCookies());
  }

  const refreshInstautoData = useCallback(() => {
    setInstautoData(getInstautoData());
  }, []);

  const isLoggedIn = !!(currentUsername && haveCookies);

  useEffect(() => {
    (async () => {
      if (!isLoggedIn) return;
      await initInstautoDb(currentUsername);
      refreshInstautoData();
    })().catch(console.error);
  }, [currentUsername, isLoggedIn, refreshInstautoData]);

  useEffect(() => {
    updateCookiesState();
  }, []);

  async function onLogoutClick() {
    await deleteCookies();
    await updateCookiesState();
    setCurrentUsername();
    cleanupInstauto();

    refreshInstautoData();
  }

  async function startInstautoAction(instautoAction) {
    if (running) {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'This will terminate the bot and you will lose any log text. Note that the bot will still remember which users it has followed, and will unfollow them in the future.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Stop the bot',
        cancelButtonText: 'Leave it running',
      });
      if (result.value) electron.remote.app.quit();
      return;
    }

    if (usersToFollowFollowersOf.length < 1) {
      await Swal.fire({ icon: 'error', text: 'Please add at least 1 username to the list!' });
      return;
    }

    if (!isLoggedIn && (username.length < 1 || password.length < 1)) {
      await Swal.fire({ icon: 'error', text: 'Please enter your username and password' });
      return;
    }

    if (fewUsersToFollowFollowersOf) {
      const { value } = await Swal.fire({ icon: 'warning', text: 'We recommended to provide at least 5 users', showCancelButton: true, confirmButtonText: 'Run anyway' });
      if (!value) return;
    }


    setLogs([]);
    setRunning(true);

    const powerSaveBlockerId = powerSaveBlocker.start('prevent-display-sleep');

    function log(level, ...args) {
      console[level](...args);
      setLogs((l) => [...l, { time: new Date(), level, args }]);
    }

    const logger = {
      log: (...args) => log('log', ...args),
      error: (...args) => log('error', ...args),
      warn: (...args) => log('warn', ...args),
      info: (...args) => log('info', ...args),
      debug: (...args) => log('debug', ...args),
    };

    try {
      if (isLoggedIn) {
        await initInstautoDb(currentUsername);
      } else {
        await deleteCookies(); // Maybe they had cookies but not yet any currentUsername (old version)
        setCurrentUsername(username);
        await initInstautoDb(username);
      }
      refreshInstautoData();

      await initInstauto({
        ...advancedSettings,

        excludeUsers: [],

        dryRun,

        username,
        password,

        logger,
      });

      await instautoAction();
    } catch (err) {
      logger.error('Failed to run', err);
      await ReactSwal.fire({
        icon: 'error',
        title: 'Failed to run',
        html: (
          <div style={{ textAlign: 'left' }}>
            Try the troubleshooting button. Error:
            <div style={{ color: '#aa0000' }}>{err.message}</div>
          </div>
        ),
      });
      if (!isDev) await onLogoutClick();
    } finally {
      setRunning(false);
      cleanupInstauto();
      powerSaveBlocker.stop(powerSaveBlockerId);
    }
  }

  async function onStartPress() {
    await startInstautoAction(async () => {
      await runBotNormalMode({
        usernames: cleanupAccounts(usersToFollowFollowersOf),
        ageInDays: advancedSettings.dontUnfollowUntilDaysElapsed,
        skipPrivate,
        runAtHour: advancedSettings.runAtHour,
        enableFollowUnfollow: advancedSettings.enableFollowUnfollow,
        maxLikesPerUser: advancedSettings.maxLikesPerUser,
        maxFollowsTotal: advancedSettings.maxFollowsPerDay, // This could be improved in the future
        instantStart,
      });
    });
  }

  async function onUnfollowNonMutualFollowersPress() {
    await startInstautoAction(async () => runBotUnfollowNonMutualFollowers());
  }

  async function onUnfollowAllUnknownPress() {
    await startInstautoAction(async () => runBotUnfollowAllUnknown());
  }

  async function onUnfollowOldFollowedPress() {
    await startInstautoAction(async () => runBotUnfollowOldFollowed({ ageInDays: advancedSettings.dontUnfollowUntilDaysElapsed }));
  }

  async function onUnfollowUserList(accounts) {
    const accountsCleaned = cleanupAccounts(accounts);
    if (accountsCleaned.length === 0) return;
    setUnfollowUserListDialogShown(false);
    await startInstautoAction(async () => runBotUnfollowUserList({ usersToUnfollow: accountsCleaned }));
  }

  async function onFollowUserList(accounts) {
    const accountsCleaned = cleanupAccounts(accounts);
    if (accountsCleaned.length === 0) return;
    setFollowUserListDialogShown(false);
    await startInstautoAction(async () => runBotFollowUserList({ users: accountsCleaned, skipPrivate }));
  }

  async function onRunTestCode() {
    await startInstautoAction(async () => runTestCode());
  }

  function onTroubleshootingClick() {
    Swal.fire({
      title: 'Troubleshooting',
      html: `
        <ul style="text-align: left">
          <li>Check that all usernames are correct.</li>
          <li>Check logs for any error</li>
          <li>Try to log out and then log back in</li>
          <li>Check that your firewall allows the app (listen to port)</li>
          <li>Restart the app</li>
        </ul>
      `,
    });
  }

  const onDonateClick = () => electron.shell.openExternal('https://mifi.no/thanks');

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div>
          {running ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 500 }}>
              <Lottie
                loop
                play={shouldPlayAnimations}
                animationData={runningLottie}
                style={{ maxWidth: 150, width: '100%' }}
              />

              <div style={{ fontSize: 27, marginBottom: 20 }}>Your bot is running</div>

              <div>
                <p>Leave the app running on your computer and keep it connected to power and prevent it from sleeping and the bot will work for you while you are doing more useful things.</p>
                <p>Please don&apos;t close/minimize the other window <span role="img" aria-label="Robot">🤖</span></p>
              </div>

              <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center' }}>
                <FaRegSmileBeam size={70} style={{ color: '#e9896a', marginRight: 15, cursor: 'pointer' }} role="button" onClick={onDonateClick} />
                <div>
                  Is SimpleInstaBot useful to you?<br />
                  I built this for free for everyone to enjoy.<br />
                  No ads. No tracking. Just coding ❤️
                  <div role="button" tabIndex="0" style={{ cursor: 'pointer', color: 'rgba(0,0,0,0.6)', fontWeight: 'bold' }} onClick={onDonateClick}>Please consider supporting my continued work</div>
                </div>
              </div>

              <LogView fontSize={10} logs={logs} />
            </div>
          ) : (
            <div style={{ maxWidth: 800 }}>
              <div style={{ display: 'flex' }}>
                <div style={{ width: '50%', margin: '10px 10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Lottie
                      loop
                      play
                      animationData={robotLottie}
                      style={{ width: 150, height: 150 }}
                    />
                  </div>

                  {isLoggedIn ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ marginBottom: 20 }}>Your bot is logged in and ready to go!</div>
                      <Button iconBefore="log-out" type="button" intent="danger" onClick={onLogoutClick}>Log out</Button>
                    </div>
                  ) : (
                    <div>
                      <TextInputField
                        isInvalid={username.length < 1}
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        label="Instagram username"
                        autoCapitalize="off"
                        autoCorrect="off"
                        spellCheck={false}
                      />

                      <TextInputField
                        value={password}
                        isInvalid={password.length < 4}
                        onChange={e => setPassword(e.target.value)}
                        type="password"
                        label="Password"
                        description="We do not store your password"
                      />
                    </div>
                  )}
                </div>

                <div style={{ width: '50%', margin: '0px 10px' }}>
                  <div style={{ marginBottom: 10, marginTop: 20 }}>
                    <AccountsList accounts={usersToFollowFollowersOf} setAccounts={setUsersToFollowFollowersOf} hasWarning={fewUsersToFollowFollowersOf} label="List of accounts followers to follow" placeholder="Influencers, celebrities, etc." tooltip={`List of accounts whose followers the bot should follow. Choose accounts with a lot of followers (e.g influencers above 100k). The bot will then visit each of these and follow their most recent followers, in hope that they will follow you back. ${advancedSettings.dontUnfollowUntilDaysElapsed} days later, it will unfollow them. For best results, choose accounts from a niche market that you want to target.`} />
                  </div>

                  <div style={{ margin: '20px 0' }}>
                    <Checkbox
                      label="Follow private accounts?"
                      checked={!skipPrivate}
                      onChange={e => setSkipPrivate(!e.target.checked)}
                    />
                  </div>

                  <div style={{ margin: '20px 0' }}>
                    <Checkbox
                      label="Like a few photos after following users?"
                      checked={advancedSettings.maxLikesPerUser > 0}
                      onChange={e => setAdvancedSetting('maxLikesPerUser', e.target.checked ? 2 : 0)}
                    />
                  </div>
                </div>
              </div>

              <div style={{ maxWidth: 600, margin: 'auto', color: 'rgba(0,0,0,0.7)' }}>
                When you press the <b>Start</b> button the bot will start immediately, then repeat every day at {advancedSettings.runAtHour}:00 until the app is stopped.<br />
                To avoid temporary blocks, please run the bot on the same internet/WiFi as you normally use your Instagram app. <b>Do not use a VPN.</b><br />
              </div>
            </div>
          )}

          <div style={{ margin: '20px 0', textAlign: 'center' }}>
            {running ? (
              <Button iconBefore="stop" height={40} type="button" intent="danger" onClick={onStartPress}>Stop bot</Button>
            ) : (
              <>
                <Tooltip content="Start the bot in the primary mode of operation (follow/unfollow/like etc)">
                  <Button iconBefore="play" height={40} type="button" intent="success" onClick={onStartPress}>Start bot</Button>
                </Tooltip>
                <br />
                <Tooltip content={`Special mode of operation: Unfollow all accounts that were followed by bot more than ${advancedSettings.dontUnfollowUntilDaysElapsed} days ago`}>
                  <Button height={30} type="button" onClick={onUnfollowOldFollowedPress}>Unfollow only</Button>
                </Tooltip>
                <Tooltip content={`Special mode of operation: Unfollow all accounts that are not following you back (except accounts that were followed by bot in the last ${advancedSettings.dontUnfollowUntilDaysElapsed} days)`}>
                  <Button height={30} type="button" onClick={onUnfollowNonMutualFollowersPress}>Unfollow non-mutual</Button>
                </Tooltip>
                <Tooltip content="Special mode of operation: Unfollow all unknown accounts (meaning unfollow all accounts that you are following, except any accounts that have been previously followed by the bot)">
                  <Button height={30} type="button" onClick={onUnfollowAllUnknownPress}>Unfollow unknown</Button>
                </Tooltip>
                <Tooltip content="Special mode of operation: Unfollow a comma separated list of accounts that you specify">
                  <Button height={30} type="button" onClick={() => setUnfollowUserListDialogShown(true)}>Unfollow list...</Button>
                </Tooltip>
                <Tooltip content="Special mode of operation: Follow a comma separated list of accounts that you specify">
                  <Button height={30} type="button" onClick={() => setFollowUserListDialogShown(true)}>Follow list...</Button>
                </Tooltip>
                {isDev && (
                  <Button height={30} type="button" onClick={() => onRunTestCode()}>Run test code</Button>
                )}
              </>
            )}
          </div>

          <div style={{ margin: '20px 0', textAlign: 'center' }}>
            <Button iconBefore="settings" type="button" onClick={() => setAdvancedVisible(true)}>Show advanced settings</Button>
            {logs.length > 0 && <Button iconBefore="list" type="button" onClick={() => setLogsVisible(true)}>Logs</Button>}
            <Button iconBefore="issue" type="button" onClick={onTroubleshootingClick}>Troubleshooting</Button>
          </div>

          {instautoData && !running && <StatisticsBanner data={instautoData} />}

          <div style={{ position: 'fixed', right: 5, bottom: 5, background: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center' }}>
            <Button appearance="minimal" onClick={() => electron.shell.openExternal('https://mifi.no/')}>More apps by mifi.no</Button>
            <Lottie
              loop
              play={!running}
              goTo={running ? 50 : undefined}
              animationData={loveLottie}
              style={{ width: 50, height: 50, margin: -10 }}
            />
          </div>
        </div>
      </div>

      <SideSheet containerProps={{ style: { maxWidth: '100%' } }} isShown={advancedVisible} onCloseComplete={() => setAdvancedVisible(false)}>
        <div style={{ margin: 20 }}>
          <h3>Advanced settings</h3>

          <AdvancedSettings dryRun={dryRun} setDryRun={setDryRun} advancedSettings={advancedSettings} onChange={setAdvancedSettings} instantStart={instantStart} setInstantStart={setInstantStart} />

          <Button iconBefore="tick" type="button" onClick={() => setAdvancedVisible(false)}>Save &amp; Close</Button>
        </div>
      </SideSheet>

      <SideSheet isShown={logsVisible} onCloseComplete={() => setLogsVisible(false)}>
        <div style={{ margin: 20 }}>
          <h3>Logs from last run</h3>

          <LogView logs={logs} fontSize={13} style={{ height: '100%' }} />
        </div>
      </SideSheet>

      <AccountsListDialog label="Unfollow accounts" isShown={unfollowUserListDialogShown} onCloseComplete={() => setUnfollowUserListDialogShown(false)} onConfirm={onUnfollowUserList} />
      <AccountsListDialog label="Follow accounts" isShown={followUserListDialogShown} onCloseComplete={() => setFollowUserListDialogShown(false)} onConfirm={onFollowUserList} />
    </>
  );
});

export default App;
