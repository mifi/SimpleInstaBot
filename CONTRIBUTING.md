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
Wait for github actions and go to https://github.com/mifi/SimpleInstaBot/releases

## Releasing `instauto`

```bash
yarn workspace instauto run version patch
yarn workspace instauto exec yarn npm publish
```
