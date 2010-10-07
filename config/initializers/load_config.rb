APP_CONFIG = YAML.load_file("#{RAILS_ROOT}/config/config.yml")[RAILS_ENV]
CONST = YAML.load_file("#{RAILS_ROOT}/config/constants.yml")
