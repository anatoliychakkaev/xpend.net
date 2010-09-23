class CreateParticipations < ActiveRecord::Migration
  def self.up
    create_table :participations do |t|
      t.integer :house_book_id
      t.integer :user_id
      t.boolean :default

      t.timestamps
    end
  end

  def self.down
    drop_table :participations
  end
end
