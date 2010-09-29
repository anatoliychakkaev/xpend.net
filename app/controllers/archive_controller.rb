class ArchiveController < ApplicationController
  before_filter :authenticate_user!
  before_filter :define_house_book

  def index
    @months = @house_book.outlay_records.find :all,
      :select => "min(created_at) as created_at, SUM(amount) as amount",
      # :conditions => "date_part('year', created_at) = 2010",
      :group => "date_part('month', created_at)",
      :order => 'created_at DESC'
    @categories = monthly_categories(@months.first.created_at)
  end

  def month
    @categories = monthly_categories(params[:date].to_date)
  end

  def category
    date = params[:date].to_date
    @outlays = @house_book.outlay_records.find :all,
      :conditions => [
        "outlay_category_id = ? AND created_at BETWEEN ? AND ?",
        params[:outlay_category_id],
        date.beginning_of_month,
        date.end_of_month
      ],
      :include => :outlay_category
  end

  private

  def monthly_categories(date)
    @house_book.outlay_records.find :all,
      :select => "outlay_category_id, SUM(amount) as amount, MIN(created_at) as created_at",
      :conditions => ["created_at BETWEEN ? AND ?", date.beginning_of_month, date.end_of_month],
      :group => "outlay_category_id",
      :include => :outlay_category
  end
end
