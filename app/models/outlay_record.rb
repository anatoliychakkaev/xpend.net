class OutlayRecord < ActiveRecord::Base
  belongs_to :user
  belongs_to :outlay_category
  belongs_to :house_book

  validates_presence_of :house_book
  validates_presence_of :outlay_category

  scope :by_date, lambda { |date| { :conditions => ['created_at BETWEEN ? AND ?', date.beginning_of_day, date.end_of_day ] } }

  def self.create_from_string(s)
    match = s.match(/(\d+|\d*[\.,]\d+)\s+(.+?):\s*(.*)$/)
    return false if match.blank?
    
    record = OutlayRecord.new({
      :amount => match[1].to_f,
      :note => match[3]
    })
    record.outlay_category = record.house_book.outlay_categories.find_or_create_by_name(match[2])
    record.save
  end
end
