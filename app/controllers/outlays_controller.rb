class OutlaysController < ApplicationController
  before_filter :authenticate_user!
  before_filter :define_house_book

  def index
    @today_records = @house_book.outlay_records.by_date(Date.today)
    @yesterday_records = @house_book.outlay_records.by_date(Date.today - 1.day)
  end

  def create
    if @house_book.outlay_records.create_from_string(params[:outlay_record])
      flash[:notice] = 'Record created'
    end
    redirect_to root_path
  end

  def destroy
    @house_book.outlay_records.find(params[:id]).destroy
    redirect_to root_path
  end

  def edit
    @outlay_record = @house_book.outlay_records.find(params[:id])
  end

  def update
    @outlay_record = @house_book.outlay_records.find(params[:id])
    if @outlay_record.update_attributes(params[:outlay_record])
      flash[:notice] = 'Record updated'
    end
    redirect_to root_path
  end

  def earlier
    rec = @house_book.outlay_records.find(
      :first,
      :conditions => ['created_at < ?', params[:date].to_date.beginning_of_day], :order => 'created_at DESC')
    @day = @house_book.outlay_records.by_date(rec.created_at) if rec
  end

end
