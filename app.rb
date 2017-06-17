require 'sinatra'
require 'json'

require File.expand_path('../lib/overrustle-vods.rb', __FILE__)

get '/' do
  File.read(File.join('public', 'index.html'))
end

get '/chat' do
  overRustleLogsParser = OverRustleLogsParser.new(JSON.parse(params["urls"]))
  overRustleLogsParser.get_chat.to_json
end

get '/users' do
  usersParser = UsersParser.new
  usersParser.get_user_data.to_json
end