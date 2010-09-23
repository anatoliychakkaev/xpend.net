class HouseBook < ActiveRecord::Base
  has_many :outlay_records
  has_many :outlay_categories
end
