class AddAllowEmailsToUsers < ActiveRecord::Migration
  def self.up
    add_column :users, :allow_emails, :boolean, :default => true
  end

  def self.down
    remove_column :users, :allow_emails
  end
end
