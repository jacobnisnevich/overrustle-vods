require 'time'
require 'cgi'
require 'open-uri'

class OverRustleLogsParser
  def initialize(urls)
    @pages = []

    urls.each do |url|
      begin
        page = open(url).read
        @pages.push(page)
      rescue OpenURI::HTTPError
        p 'Error: page not found'
      end
    end
  end

  def get_chat
    chat_hashes = []

    @pages.each do |page|
      chat_array = page.split("\n")
      chat_hash = {}

      chat_array.each do |chat_line|
        index = chat_line.index(': ')
        length = chat_line.length

        timestamp = Time.parse(chat_line[1, 23]).iso8601
        username = chat_line[26, index - 26]
        message = CGI.escapeHTML(chat_line[index + 2, length - (index + 2)])

        if chat_hash[timestamp].nil?
          chat_hash[timestamp] = []
        end

        chat_hash[timestamp].push({
          'username' => username,
          'message' => message
        })
      end

      chat_hashes.push chat_hash
    end

    chat_hashes.inject(:merge)
  end
end
