source ENV['GEM_SOURCE'] || 'https://rubygems.org'

gem 'sinatra',            '~> 1.4.5'
gem 'unicorn',            '~> 4.8.3'
gem 'jenkins_api_client', '~> 1.0.1'
gem 'deterministic',      '~> 0.6.0'
gem 'foreman'
gem 'memcached'

if File.exists? "#{__FILE__}.local"
  eval(File.read("#{__FILE__}.local"), binding)
end
