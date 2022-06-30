# SimpleInstaBot 🤖

Use a robot to attract more followers. Now as a simple desktop app!

[![Demo](https://img.youtube.com/vi/xkjOozYU3aA/0.jpg)](https://www.youtube.com/watch?v=xkjOozYU3aA)

[![Discord](https://img.shields.io/discord/986052713425027072)](https://discord.gg/Rh3KT9zyhj) [![PayPal](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://paypal.me/mifino/usd)

## How does it work?

It runs as a desktop application on your computer and will every day follow up to 150 users (configurable). You choose a list of Instagram users whose market you want to target. The bot navigates to each of these, finds the last people to have followed them and then follows each of them. Then after 5 days (also configurable), it will unfollow the users. Simple and effective.

The bot will remember every user it has followed, so if you quit the app and open it later, it will still clean up by unfollowing users that it previously followed.

You can find logs and data in your "App Data" folder. See [userData](https://www.electronjs.org/docs/api/app#appgetpathname). For example on Mac OS:
```
Library/Application\ Support/SimpleInstaBot/followed.json
```

## Features

What makes it different from other bots?

- Free and open source
- No viruses or fishy business, guaranteed to not store your password! (See the code for yourself)
- Simple, easy to use
- Effective: Follow/unfollow is proven very effective. By only doing follow/unfollow, the bot avoids all those awkward situations where a bot comments "Awesome!" on a post depicting a tragic events.
- Secure: Never stores your username or password
- Safe: Runs on your own computer, to reduce the risk of being banned. Instagram is known to crack down on paid Instagram bot services and cloud and VPN IPs
- Automatic rate limiting
- Uses a normal browser to mimic the behavior of a normal user (does not use private APIs easily detectable by Instagram)
- Randomized timed behavior
- Simulates human behavior of sleeping at night, and usage in the day time
- Change browser signature to avoid being identified
- Passes bot tests: https://intoli.com/blog/not-possible-to-block-chrome-headless/chrome-headless-test.html and https://arh.antoinevastel.com/bots/areyouheadless
- Runs on all major desktop platforms
- Multiple modes of operation: Unfollow only, Unfollow non-mutual followers, Unfollow unknown followed accounts, Unfollow user specified list of accounts.

## Download

- [Mac OS X](https://github.com/mifi/SimpleInstaBot/releases/latest/download/SimpleInstaBot-mac.dmg)
- [Windows](https://github.com/mifi/SimpleInstaBot/releases/latest/download/SimpleInstaBot-win.exe)
- [Linux (x64) AppImage](https://github.com/mifi/SimpleInstaBot/releases/latest/download/SimpleInstaBot-linux-x86_64.AppImage)
- [Linux (x64) tar.tz](https://github.com/mifi/SimpleInstaBot/releases/latest/download/SimpleInstaBot-linux-x64.tar.bz2)
- [Linux (armv7l) (Raspberry Pi) tar.tz](https://github.com/mifi/SimpleInstaBot/releases/latest/download/SimpleInstaBot-linux-armv7l.tar.bz2)

NOTE: After installing you may need to bypass "Untrusted app" dialogs. This is because Microsoft requires a costly certificate to remove this dialog (I'm not going to pay for that.) Alternatively, try to Google `windows run untrusted app`.

## A word of warning

Many people are getting `Action Blocked` message these days with this bot as well as other bots (it seems even people just manually following using the app) Instagram is tightening their rules by not allowing promiscuous behavior like following and liking strangers' photos as much as before, and imposing temp blocks when they think you crossed the limit.

**You use this app at your own risk! I have had great success with this app but I am not responsible for any consequences it may have for your Instagram account.**

## Tips to avoid ban

I advise you to follow these guidelines:

- Run the bot on the same internet connection (e.g. WiFi) as you normally use your phone with the Instagram mobile app. It will reduce the chance of being flagged
- Use conservative parameters (max follows/unfollows per day 150 and max 20 per hour, maybe even start lower, and work your way up)

## API / programmatic bot

SimpleInstaBot is built on [instauto](https://github.com/mifi/instauto) - you can instead use that if you want to program your own headless bot.

## How to run on Raspberry PI

```bash
# SSH into your PI
ssh pi@ip.of.pi

# Download the Raspberry Pi binary
wget https://github.com/mifi/SimpleInstaBot/releases/latest/download/SimpleInstaBot-linux-armv7l.tar.bz2

# Extract it
tar xvf SimpleInstaBot-linux-armv7l.tar.bz2
cd SimpleInstaBot-linux-armv7l

# run it
DISPLAY=:0 ./simpleinstabot

# or:
DISPLAY=:0 ./simpleinstabot --no-sandbox
```

## Troubleshooting

 - Follow button not found: switch your Instagram account into English as stated in the [instauto](https://www.npmjs.com/package/instauto) troubleshooting page

## FAQ

- Q: Can I run it on multiple accounts at the same time?
- A: No, currently you would need multiple PC's or multiple VMs for that. See [#27](https://github.com/mifi/SimpleInstaBot/issues/27)
- Q: Can I run it on multiple accounts (but not at the same time)?
- A: Yes, just log out, and then log in to your other account instead. Followed/liked etc will be remembered.

## Donate 🙈

This project is maintained by me alone. The project will always remain free and open source, but if it's useful for you, consider supporting me. :) It will give me extra motivation to improve it.

[Paypal](https://paypal.me/mifino/usd) | [crypto](https://mifi.no/thanks)

## Credits

Animations by:
- https://lottiefiles.com/juanmakes
- https://lottiefiles.com/user/180952
- https://lottiefiles.com/aanhamdani

Icons made by [Freepik](https://www.flaticon.com/authors/freepik) from [www.flaticon.com](https://www.flaticon.com/)

## See also
- https://github.com/mifi/instauto - Programmatic Instagram bot API
- https://instagrambot.github.io/
- https://socialmanager.tools/
- https://gramup.me/

## Releasing

```
npm version patch && git push && git push --tags
```
Wait for github actions and go to https://github.com/mifi/SimpleInstaBot/releases

---

Made with ❤️ in [🇳🇴](https://www.youtube.com/watch?v=uQIv8Vo9_Jc)

[More apps by mifi.no](https://mifi.no/)

Follow me on [GitHub](https://github.com/mifi/), [YouTube](https://www.youtube.com/channel/UC6XlvVH63g0H54HSJubURQA), [IG](https://www.instagram.com/mifi.no/), [Twitter](https://twitter.com/mifi_no) for more awesome content!
