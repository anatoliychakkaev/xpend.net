themes = Dir[Rails.root.join('public/stylesheets/*')].collect{ |f| f.split('/').last.to_sym }
for theme in themes do
  styles = Dir[Rails.root.join("public/stylesheets/#{theme.to_s}/*")].collect{ |f| [theme.to_s, f.split('/').last].join('/') }
  ActionView::Helpers::AssetTagHelper.register_stylesheet_expansion theme => styles
end
