require 'sinatra'
require 'json'

require File.expand_path('../lib/overrustle-vods.rb', __FILE__)

get '/' do
  File.read(File.join('public', 'index.html'))
end

get '/chat' do
  overRustleLogsParser = OverRustleLogsParser.new(params["url"])
  overRustleLogsParser.get_chat.to_json
end
