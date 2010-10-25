class User < ActiveRecord::Base

  # Include default devise modules. Others available are:
  # :token_authenticatable, :lockable and :timeoutable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable, :confirmable

  # Setup accessible (or protected) attributes for your model
  attr_accessible :email, :password, :password_confirmation, :remember_me, :time_zone, :locale

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
  
  def unsubscribe!
    update_attribute :allow_emails, false
  end

  def has_outlays_today?
    return true if email == 'rpm1602@gmail.com'
    Time.zone = time_zone
    outlay = default_house_book.outlay_records.last
    outlay && outlay.created_at > Time.zone.now.beginning_of_day
  end

  class << self

    def send_reminders
      User.find_all_by_allow_emails(true).each do |user|
        UserMailer.notification(user).deliver unless user.has_outlays_today?
      end
    end

  end
end
