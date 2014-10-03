$LOAD_PATH.unshift File.expand_path('../lib', __FILE__)

require 'waylon/version'

Gem::Specification.new do |s|
  s.name          = 'waylon'
  s.version       = Waylon::VERSION
  s.date          = '2014-09-01'
  s.authors       = ['Roger Ignazio']
  s.email         = ['me@rogerignazio.com']
  s.homepage      = 'https://github.com/rji/waylon'
  s.summary       = 'Waylon is a dashboard to display the status of your Jenkins builds.'
  s.description   = s.summary
  s.license       = 'Apache License, Version 2.0'

  #s.files         = `git ls-files`.split('\n')
  #s.require_paths = ['lib']
  #s.bindir        = 'bin'
  #s.executables   = 'waylon'

  s.add_dependency 'sinatra',            '~> 1.4.5'
  s.add_dependency 'jenkins_api_client', '~> 1.0.1'
end

