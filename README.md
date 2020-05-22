# OverRustle VODs

**OverRustle VODs** is a simple web app that plays Destiny Twitch VODs with the destiny.gg/OverRustle chat along the side in real-time

## Running the Project

OverRustle VODs requires Ruby to run properly. I've tested with Ruby `2.2.1p85` using rvm on Ubuntu 14.04. To build the project simply run 

```
bundle install
```

to install all gem dependencies

Don't forget to edit the .env file:

```bash
cp ./.env.example ./.env
vim ./.env
```
and then start the project with
```
ruby app.rb
```

## Deploying to Heroku

Deploying to Heroku is pretty straightforward, but you need to add the "TWITCH_CLIENT_ID", "TWITCH_CLIENT_SECRET" and "YOUTUBE_API_KEY" config vars in Settings before deploying.
