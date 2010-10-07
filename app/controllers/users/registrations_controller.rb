class Users::RegistrationsController < Devise::RegistrationsController
  def update
    cookies.permanent["theme"] = params[:design_theme]
    super
  end
end
