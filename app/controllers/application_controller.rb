class ApplicationController < ActionController::Base
  protect_from_forgery

  layout :layout_by_resource

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

end
