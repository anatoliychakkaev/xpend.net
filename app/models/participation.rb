class Participation < ActiveRecord::Base
  belongs_to :user
  belongs_to :house_book
  before_save :check_users_default_book

  def check_users_default_book
    return if !default
    default_par = user.participations.find_by_default(true)
    if default_par && default_par.house_book != house_book
      default_par.update_attribute :default, false
    end
  end

end
