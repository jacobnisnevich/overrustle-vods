require 'time'

class OverRustleLogsParser
  def initialize(urls)
    @pages = []

    urls.each do |url|
      begin
        page = Nokogiri::HTML(open(url), nil, Encoding::UTF_8.to_s)
        @pages.push(page)
      rescue OpenURI::HTTPError
        p 'Error: page not found'
      end
    end
  end

  def get_chat
    chat_hashes = []

    @pages.each do |page|
      chat_array = page.text.split("\n")
      chat_hash = {}

      chat_array.each do |chat_line|
        index = chat_line.index(': ')
        length = chat_line.length

        timestamp = Time.parse(chat_line[1, 23]).iso8601
        username = chat_line[26, index - 26]
        message = chat_line[index + 2, length - (index + 2)]

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
