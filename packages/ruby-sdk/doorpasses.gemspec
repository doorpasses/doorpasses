require_relative 'lib/doorpasses/version'

Gem::Specification.new do |spec|
  spec.name          = 'doorpasses'
  spec.version       = DoorPasses::VERSION
  spec.authors       = ['DoorPasses Team']
  spec.email         = ['support@doorpasses.io']

  spec.summary       = 'Official Ruby SDK for DoorPasses - Digital Access Control Platform'
  spec.description   = 'Ruby SDK for integrating with DoorPasses\'s digital access control platform. ' \
                       'Manage access passes, card templates, and more with native Ruby support.'
  spec.homepage      = 'https://github.com/mohammedzamakhan/doorpasses'
  spec.license       = 'MIT'
  spec.required_ruby_version = '>= 2.7.0'

  spec.metadata['homepage_uri'] = spec.homepage
  spec.metadata['source_code_uri'] = 'https://github.com/mohammedzamakhan/doorpasses'
  spec.metadata['changelog_uri'] = 'https://github.com/mohammedzamakhan/doorpasses/blob/main/CHANGELOG.md'
  spec.metadata['bug_tracker_uri'] = 'https://github.com/mohammedzamakhan/doorpasses/issues'
  spec.metadata['documentation_uri'] = 'https://docs.doorpasses.io'

  # Specify which files should be added to the gem when it is released.
  spec.files = Dir.glob(%w[
    lib/**/*.rb
    *.gemspec
    *.md
    LICENSE
  ])

  spec.require_paths = ['lib']

  # Runtime dependencies
  spec.add_dependency 'faraday', '~> 2.0'
  spec.add_dependency 'faraday-net_http', '~> 3.0'

  # Development dependencies
  spec.add_development_dependency 'bundler', '~> 2.0'
  spec.add_development_dependency 'rake', '~> 13.0'
  spec.add_development_dependency 'rspec', '~> 3.12'
  spec.add_development_dependency 'webmock', '~> 3.18'
  spec.add_development_dependency 'rubocop', '~> 1.50'
  spec.add_development_dependency 'simplecov', '~> 0.22'
end
