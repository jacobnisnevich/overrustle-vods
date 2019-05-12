require 'json'
require 'open-uri'
require 'nokogiri'

[
  "overrustle-logs-parser.rb"
  # "users-parser.rb"
].each do |file_name|
  require File.expand_path("../overrustle-vods/#{file_name}", __FILE__)
end
