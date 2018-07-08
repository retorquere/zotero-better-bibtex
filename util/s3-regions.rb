#!/usr/bin/env ruby

require 'nokogiri'
require 'open-uri'
require 'json'
require 'benchmark'

page = Nokogiri::HTML(open('https://docs.aws.amazon.com/general/latest/gr/rande.html'))

tables = page.at('//h2[@id="s3_region"]').parent
s3_region = false
table = nil
tables.children.each{|node|
  s3_region = true if node.name == 'h2' && node['id'] == 's3_region'

  table = node if table.nil? && s3_region && node.name == 'div' && node['class'] == 'table'
}

def compact(region)
  region = '' + region
  region.sub!('-northeast-', 'ne')
  region.sub!('-south-', 's')
  region.sub!('-southeast-', 'se')
  region.sub!('-central-', 'c')
  region.sub!('-north-', 'n')
  region.sub!('-northwest-', 'nw')
  region.sub!('-west-', 'w')
  region.sub!('-east-', 'e')
  return region
end

regions = {}
table.xpath('.//tr').each{|tr|
  cells = tr.xpath('.//td')
  next if cells.length == 0

  name = cells[0].text
  id = cells[1].text

  regions[id] = { postfix: compact(id), name: name }
}

puts "Total:\n" + Benchmark.measure {
  regions.keys.each{|region|
    puts "#{region} (#{regions[region][:name]})"
    puts Benchmark.measure {
      begin
        ping = open("http://s3.#{region}.amazonaws.com/ping")
      rescue => e
        puts "#{e}: Skipping #{region}"
        regions.delete(region)
      end
    }
  }
}.to_s
File.open(File.join(File.dirname(__FILE__), '..', 'content', 's3.json'), 'w'){|f| f.puts(JSON.pretty_generate(regions)) }
