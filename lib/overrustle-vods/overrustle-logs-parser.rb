require 'time'

class OverRustleLogsParser
  def initialize(url)
    @page = Nokogiri::HTML(open(url))
  end

  def get_chat
    chat_array = @page.text.split("\n")
    chat_hash = {}

    p chat_array[0]

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

    chat_hash
  end
end
