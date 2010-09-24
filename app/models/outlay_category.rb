class OutlayCategory < ActiveRecord::Base
  has_many :outlay_records
  validates_presence_of :name
end
