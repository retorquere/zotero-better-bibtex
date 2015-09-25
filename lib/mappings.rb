mappings = {}
IO.readlines('mappings.txt').each{|line|
  base, type, field = *line.strip.split('|')

  mappings[type]  ||= {}
  mappings[type][field] = base
}

puts "    switch item.itemType"

mappings.each_pair{|type, map|
  puts "      when '#{type}'"
  map.each_pair{|field, base|
    puts "        item.#{base} ?= item.#{field}"
  }
}
