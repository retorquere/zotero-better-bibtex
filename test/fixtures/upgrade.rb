require 'json'

def upgrade(json)
  data = JSON.parse(File.read(json))
  if data.is_a?(Hash) && data.dig('config', 'preferences', 'jabrefGroups')
    puts json
    data['config']['preferences']['jabrefFormat'] = data['config']['preferences']['jabrefGroups']
    data['config']['preferences'].delete('jabrefGroups')
    open(json, 'w'){|f| f.puts(JSON.pretty_generate(data)) }
  end
end

Dir['export/*.json'].each{|json|
  upgrade(json)
}
Dir['import/*.json'].each{|json|
  upgrade(json)
}
