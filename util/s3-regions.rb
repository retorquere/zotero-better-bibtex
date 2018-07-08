#!/usr/bin/env ruby

require 'nokogiri'
require 'open-uri'

page = Nokogiri::HTML(open('https://docs.aws.amazon.com/general/latest/gr/rande.html'))

tables = page.at('//h2[@id="s3_region"]').parent
s3_region = false
table = nil
tables.children.each{|node|
  s3_region = true if node.name == 'h2' && node['id'] == 's3_region'

  table = node if table.nil? && s3_region && node.name == 'div' && node['class'] == 'table'
}

regions = []
table.xpath('.//tr').each{|tr|
  cells = tr.xpath('.//td')
  next if cells.length == 0
  puts "#{cells[1].text.inspect}: #{cells[0].text.inspect}"
}

