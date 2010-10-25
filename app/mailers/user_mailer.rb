class UserMailer < ActionMailer::Base
  default :from => "noreply@xpend.net"

  def notification(user)
    @user = user
    mail(:to => user.email, :subject => 'Не забудьте отметить расходы')
  end
end
