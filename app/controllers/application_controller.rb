class ApplicationController < ActionController::Base
  protect_from_forgery

  layout :layout_by_resource

  # before_filter :set_user_language
  before_filter :set_user_time_zone

  protected

  def set_user_time_zone
    Time.zone = 'Moscow' #current_user.time_zone unless current_user.blank?
  end

  def layout_by_resource
    unless user_signed_in?
      "landing"
    else
      if devise_controller?
        "devise"
      else
        "application"
      end
    end
  end

  def define_house_book
    @house_book = current_user.default_house_book if user_signed_in?
  end
end
