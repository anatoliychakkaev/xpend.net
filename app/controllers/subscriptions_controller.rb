class SubscriptionsController < ApplicationController
  before_filter :authenticate_user!

  def unsubscribe
  end

  def destroy
    if current_user.unsubscribe!
      flash[:notice] = t 'subscription.unsubscribe_successfull'
      redirect_to root_path
    else
      flash[:alert] = t 'subscription.unsubscribe_fail'
      render :unsubscribe
    end
  end

end
