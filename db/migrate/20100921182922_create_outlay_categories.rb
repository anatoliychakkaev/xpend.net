class CreateOutlayCategories < ActiveRecord::Migration
  def self.up
    create_table :outlay_categories do |t|
      t.string :name
      t.integer :house_book_id

      t.timestamps
    end
  end

  def self.down
    drop_table :outlay_categories
  end
end
