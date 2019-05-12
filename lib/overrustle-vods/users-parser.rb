# require 'firebase'
# 
# class UsersParser
#   def initialize()
#     base_uri = 'https://destinygg-chat-scraper.firebaseio.com'
#     @firebase = Firebase::Client.new(base_uri)
#   end
# 
#   def get_user_data()
#     response = @firebase.get('/users')
#     response.body
#   end
# end
