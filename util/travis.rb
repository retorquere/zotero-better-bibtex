#!/usr/bin/env ruby

require 'yaml'

travis = YAML::load_file('.travis.yml')

case ARGV[0][0]
  when 'i'
    travis['script'] = File.read('.travis.sh')
    File.open('.travis.yml', 'w'){|f| f.puts(travis.to_yaml) }
  when 'e'
    File.open('.travis.sh', 'w'){|f| f.puts(travis['script']) }
end
