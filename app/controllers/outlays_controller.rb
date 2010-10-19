class OutlaysController < ApplicationController
  before_filter :authenticate_user!
  before_filter :define_house_book

  def index
    @today_records = @house_book.outlay_records.by_date(Time.zone.now.to_date)
    @yesterday_records = @house_book.outlay_records.by_date(Time.zone.now.to_date - 1.day)
  end

  def create
    if @record = @house_book.outlay_records.create_from_string(params[:outlay_record])
      flash[:notice] = 'Record created'
      @day = @house_book.outlay_records.by_date(Time.zone.now.to_date)
    end
    redirect_to root_path unless request.xhr?
  end

  def destroy
    record = @house_book.outlay_records.find(params[:id])
    @time = record.created_at
    @day = @house_book.outlay_records.by_date(@time)
    record.destroy
    redirect_to root_path unless request.xhr?
  end

  def edit
    @outlay_record = @house_book.outlay_records.find(params[:id])
  end

  def update
    @outlay_record = @house_book.outlay_records.find(params[:id])
    if @outlay_record.update_attributes(params[:outlay_record])
      flash[:notice] = 'Record updated'
    end
    redirect_to root_path unless request.xhr?
    if request.xhr?
      @time = @outlay_record.created_at
      @day = @house_book.outlay_records.by_date(@time)
    end
  end

  def earlier
    rec = @house_book.outlay_records.find(
      :first,
      :conditions => ['created_at < ?', params[:date].to_date.beginning_of_day], :order => 'created_at DESC')
    @day = @house_book.outlay_records.by_date(rec.created_at) if rec
  end

end
