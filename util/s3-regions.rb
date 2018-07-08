#!/usr/bin/env ruby

require 'dotenv/load'
require 'nokogiri'
require 'open-uri'
require 'json'
require 'benchmark'
require 'set'

arn = ENV['AWSARN'] || ARGV[2]
arn =~ /^arn:aws:iam::([0-9]+):user\/([a-z]+)$/
account = $1

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

  map = {
    central: 'c',
    east: 'e',
    northeast: 'ne',
    north: 'n',
    northwest: 'nw',
    southeast: 'se',
    south: 's',
    west: 'w',
  }

  #region.sub!(/-([0-9]+)$/){|num| '-' + $1.to_i.pred.to_s }
  region.sub!(/-1$/, '-')
  region.sub!(/-([a-z]+)-/){|loc| map[$1.to_sym] || (raise "Unknown location #{$1}") }

  return region
end

regions = {}
table.xpath('.//tr').each{|tr|
  cells = tr.xpath('.//td')
  next if cells.length == 0

  name = cells[0].text
  region = cells[1].text

  tld = (region.sub(/-.*/, '') == 'cn') ? '.cn' : ''
  regions[region] = { tld: tld, short: compact(region), name: name }
}

shorts = Set.new
duplicates = regions.values.collect{|r| r[:short]}.find{|r| !shorts.add?(r) }
raise "Duplicate short codes: #{duplicates.inspect}" unless duplicates.nil? || duplicates.empty?

pkg = JSON.parse(File.read(File.join(File.dirname(__FILE__), '..', 'package.json')))

puts "Total:\n" + Benchmark.measure {
  regions.keep_if{|region, details|
    puts "#{region} (#{details[:name]})"
    begin
      puts Benchmark.measure {
        ping = open("http://s3.#{region}.amazonaws.com#{details[:tld]}/ping")
      }
      pkg['bugs']['logs']['regions'].include?(region)
    rescue => e
      puts "#{e}: Skipping #{region}"
      false
    end
  }
}.to_s
File.open(File.join(File.dirname(__FILE__), '..', 'content', 's3.json'), 'w'){|f| f.puts(JSON.pretty_generate(regions)) }


pkg['bugs']['logs']['regions'].each{|region|
  bucket = pkg['bugs']['logs']['bucket'] + '-' + regions[region][:short]

	policy = {
    Version: '2012-10-17',
    Statement: [
      {
        Sid: 'allow-anon-put',
        Effect: 'Allow',
        Principal: {
          AWS: '*'
        },
        Action: 's3:PutObject',
        Resource: "arn:aws:s3:::#{bucket}/*",
        Condition: {
          StringEquals: { 's3:x-amz-acl': 'bucket-owner-full-control' },
          StringLike: { 's3:x-amz-storage-class': 'STANDARD' },
        }
      },
      {
        Sid: 'deny-other-actions',
        Effect: 'Deny',
        NotPrincipal: {
          AWS: [
            "arn:aws:iam::#{account}:root",
            arn,
          ]
        },
        NotAction: [
          's3:PutObject',
          's3:PutObjectAcl'
        ],
        Resource: "arn:aws:s3:::#{bucket}/*"
      }
    ]
  }

	File.open(File.join(File.dirname(__FILE__), '..', "#{bucket}.json"), 'w'){|f| f.puts(JSON.pretty_generate(policy)) }

	file = 'zotero.sqlite'
  puts "curl -X PUT -T #{file} -H 'x-amz-acl: bucket-owner-full-control' -H 'x-amz-storage-class: STANDARD' https://#{bucket}.s3-#{region}.amazonaws.com/#{file}"
}
