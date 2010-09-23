class CreateOutlayRecords < ActiveRecord::Migration
  def self.up
    create_table :outlay_records do |t|
      t.integer :outlay_category_id
      t.integer :house_book_id
      t.decimal :amount
      t.string :note

      t.timestamps
    end
  end

  def self.down
    drop_table :outlay_records
  end
end
