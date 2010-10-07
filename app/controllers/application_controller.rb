class ApplicationController < ActionController::Base
  protect_from_forgery

  layout :layout_by_resource

  before_filter :init_user_settings

  protected

  def layout_by_resource
    unless user_signed_in?
      "landing"
    else
      "application"
    end
  end

  def define_house_book
    @house_book = current_user.default_house_book if user_signed_in?
  end 

  def init_user_settings

    theme = cookies["theme"]
    # raise theme.inspect
    @theme = theme && CONST['themes'].include?(theme) ? theme.to_sym : :light

    locale_guess_needed = true
    if user_signed_in?
      # time zone
      Time.zone = current_user.time_zone || 'Moscow' #current_user.time_zone unless current_user.blank?
      # locale
      if current_user.locale
        I18n.locale = current_user.locale
        locale_guess_needed = false
      end
    end

    if locale_guess_needed
      locales = %w(en ru)
      user_locales = env['HTTP_ACCEPT_LANGUAGE'].split(',')
      user_locales.each do |locale_str|
        locale = locale_str.split(';').first
        if locale && locales.include?(locale)
          I18n.locale = locale
          return
        end
      end
    end
  end

end
