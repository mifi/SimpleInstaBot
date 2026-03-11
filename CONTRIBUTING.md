# Contributing

## Local development

```bash
yarn workspace instauto watch

yarn workspace simpleinstabot dev
```

## Releasing SimpleInstaBot

```bash
yarn workspace simpleinstabot run version patch
git push --follow-tags
```
Wait for github actions to finish and go to https://github.com/mifi/SimpleInstaBot/releases

## Releasing `instauto`

Only needed if changes are made.

```bash
yarn workspace instauto run version patch
yarn workspace instauto exec yarn npm publish
git push --follow-tags
```
