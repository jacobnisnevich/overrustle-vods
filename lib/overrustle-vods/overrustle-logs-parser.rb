require 'time'
require 'cgi'

class OverRustleLogsParser
  def initialize(urls, from, to)
    @pages = []
    timestamps = []
    from_stamp = from
    to_stamp = to
    start_pos = nil
    end_pos = nil

    # download logs to memory, split to chatlines
    urls.each do |url|
      begin
        page = open(url).read.split("\n")
        @pages.push(page).flatten!
      rescue OpenURI::HTTPError
        p 'Error: page not found'
      end
    end

    # create a timestamps array
    @pages.each do |page|
      timestamps.append(page[1, 23])
    end

    # if there's no chatline at the initial timestamp, look for the closest one
    while start_pos.nil?
      start_pos = timestamps.index(from_stamp)
      from_stamp = (Time.parse(from_stamp) - 1).strftime("%Y-%m-%d %H:%M:%S UTC")
    end

    # same here for the last chatline
    while end_pos.nil?
      end_pos = timestamps.rindex(to_stamp)
      to_stamp = (Time.parse(to_stamp) + 1).strftime("%Y-%m-%d %H:%M:%S UTC")
    end

    #keep only the necessary chatlines
    @pages = @pages[start_pos...end_pos]
  end

  def get_chat
    chat_hash = {}

    @pages.each do |chat_line|
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

    chat_hash
  end
end
