require 'dotenv/load'
require 'httparty'
require 'sinatra'
require 'json'
require 'open-uri'

require File.expand_path('../lib/overrustle-vods.rb', __FILE__)

token_url = "https://id.twitch.tv/oauth2/token?client_id=" + ENV['TWITCH_CLIENT_ID'] + "&client_secret=" + ENV['TWITCH_CLIENT_SECRET'] + "&grant_type=client_credentials"

def get_token(token_url)
  app_token = JSON.parse(HTTParty.post(token_url).response.body)
  access_token = app_token['access_token']

  return access_token
end

def validate_token(auth_header)
  token_check = JSON.parse(open("https://id.twitch.tv/oauth2/validate", "Authorization" => auth_header).string)
  if token_check['status']
    return 0
  end
  expiry = token_check['expires_in']

  return expiry
end

twitch_token = get_token(token_url)

get '/' do
  File.read(File.join('public', 'index.html'))
end

get '/chat' do
  overRustleLogsParser = OverRustleLogsParser.new(JSON.parse(params["urls"]))
  overRustleLogsParser.get_chat.to_json
end

get '/vidinfo' do
  if params['id']
    response = open("https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails" + "&id=" + params['id'] + "&key=" + ENV['YOUTUBE_API_KEY'], "Accept" => "application/json")
  end
  response
end

get '/userinfo' do
  oauth_header = "OAuth " + twitch_token
  expiry = validate_token(oauth_header)
  if expiry == 0
    twitch_token = get_token(token_url)
  end
  bearer_header = "Bearer " + twitch_token
  if params['user_login']
    response = open("https://api.twitch.tv/helix/streams?user_login=" + params['user_login'], "Authorization" => bearer_header, "Client-ID" => ENV['TWITCH_CLIENT_ID'])
  end
  response
end

get '/vodinfo' do
  oauth_header = "OAuth " + twitch_token
  expiry = validate_token(oauth_header)
  if expiry == 0
    twitch_token = get_token(token_url)
  end
  bearer_header = "Bearer " + twitch_token
  if params['id']
    response = open("https://api.twitch.tv/helix/videos?id=" + params['id'], "Authorization" => bearer_header, "Client-ID" => ENV['TWITCH_CLIENT_ID'])
  end
  if params['user_id'] and !params['after']
    response = open("https://api.twitch.tv/helix/videos?user_id=" + params['user_id'] + "&first=" + params['first'] + "&type=" + params['type'], "Authorization" => bearer_header, "Client-ID" => ENV['TWITCH_CLIENT_ID'])
  end
  if params['user_id'] and params['after']
    response = open("https://api.twitch.tv/helix/videos?user_id=" + params['user_id'] + "&first=" + params['first'] + "&type=" + params['type'] + "&after=" + params['after'], "Authorization" => bearer_header, "Client-ID" => ENV['TWITCH_CLIENT_ID'])
  end
  response
end

get '/emotes' do
  emotes = open('https://cdn.destiny.gg/emotes/emotes.json')
  emotes
end

# get '/users' do
#   usersParser = UsersParser.new
#   usersParser.get_user_data.to_json
# end
