class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :token_authenticatable, :confirmable, :lockable and :timeoutable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  # Setup accessible (or protected) attributes for your model
  attr_accessible :email, :password, :password_confirmation, :remember_me, :time_zone

  has_many :participations
  has_many :house_books, :through => :participations

  after_create :create_default_house_book

  def create_default_house_book
    username = email.split('@').first
    house_books.create({
      :name => "#{username.capitalize}'s house book"
    })
    participations.last.update_attribute :default, true
  end

  def default_house_book
    participations.find_by_default(true).house_book
  end

end
