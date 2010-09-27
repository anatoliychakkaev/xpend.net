# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ :name => 'Chicago' }, { :name => 'Copenhagen' }])
#   Mayor.create(:name => 'Daley', :city => cities.first)
# u = User.create(:email => 'rpm1602@gmail.com', :password => '123123', :password_confirmation => '123123')
# house_book_id = u.house_books.first.id
# 
# YAML.load(File.read('/tmp/outlay_categories.yml')).each do |c|
#   c["house_book_id"] = house_book_id
#   OutlayCategory.create(c)
# end
# 
# YAML.load(File.read('/tmp/outlays.yml')).each do |c|
#   c["house_book_id"] = house_book_id
#   c.except!('user_id')
#   OutlayRecord.create(c)
# end
