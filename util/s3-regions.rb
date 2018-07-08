#!/usr/bin/env ruby

require 'nokogiri'
require 'open-uri'
require 'json'

page = Nokogiri::HTML(open('https://docs.aws.amazon.com/general/latest/gr/rande.html'))

$package = JSON.parse(File.read('package.json'))

tables = page.at('//h2[@id="s3_region"]').parent
s3_region = false
table = nil
tables.children.each{|node|
  s3_region = true if node.name == 'h2' && node['id'] == 's3_region'

  table = node if table.nil? && s3_region && node.name == 'div' && node['class'] == 'table'
}

def compact(region)
  if $package['bugs']['logs']['regions'].include?(region)
    prefix = $package['bugs']['logs']['bucket'] + '-'
  else
    prefix = ''
  end

  region.sub!('-northeast-', 'ne')
  region.sub!('-south-', 's')
  region.sub!('-southeast-', 'se')
  region.sub!('-central-', 'c')
  region.sub!('-north-', 'n')
  region.sub!('-northwest-', 'nw')
  region.sub!('-west-', 'w')
  region.sub!('-east-', 'e')

  return prefix + region
end

regions = []
table.xpath('.//tr').each{|tr|
  cells = tr.xpath('.//td')
  next if cells.length == 0
  regions << [cells[1].text, compact(cells[1].text), cells[0].text]
}
regions.sort_by{|region| region[0]}.each{|region|
  puts region.inspect
}

