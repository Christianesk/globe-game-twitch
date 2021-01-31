
# Description

This game is based on the tutorial of [CodingGarden](https://github.com/CodingGarden/SeedlingDrop)

NOTE: this project is only to run it in development environment and use it in your OBS platform.


## Installation

```bash
$ npm install
```

## Register App in Twitch

[Register App](https://dev.twitch.tv/console)

## Get Oauth Token

[Get Token](https://twitchapps.com/tmi/)

## Create File .env

```
PORT=3000
NODE_ENV=development
USERNAME= Name Twitch App
OAUTH= TOKEN
```


## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```
