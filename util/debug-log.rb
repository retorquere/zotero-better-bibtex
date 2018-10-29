#!/usr/bin/env ruby

require 'dotenv/load'
require 'rubygems'
require 'aws-sdk'
require 'json'

def readJSON(path)
  return JSON.parse(File.read(File.join(File.dirname(__FILE__), '..', path)))
end

package = readJSON('package.json')
regions = readJSON('content/s3.json')

prefix = package['bugs']['logs']['bucket']
puts prefix
regions.each_pair{|region, details|
  bucket = "#{prefix}-#{details['short']}"
  #puts "#{region}: #{bucket}"
  s3 = Aws::S3::Resource.new(region: region)
  logs = s3.bucket(bucket)

  merge = {}

  logs.objects.each do |obj|
    if obj.key =~ /([^\/]+)\.([0-9]+)\.(txt|json)$/
      target = "#{$1}.#{$3}"
    else
      target = File.basename(obj.key)
    end

    merge[target] ||= []
    merge[target] << obj
  end

  if ARGV.length == 0
    merge.keys.collect{|k| k.split('-')[0]}.uniq.each{|log|
      puts log
    }
  else
    matches = merge.select{|k, v|
      ARGV.find{|s| k.downcase.include?(s.downcase)}
    }
    matches.each_pair{|target, partials|
      if File.file?(target)
        puts "skipping #{target}"
        next
      end

      puts "saving #{target}"
      open(target, 'w'){|f|
        partials.sort_by{|partial| partial.key}.each_with_index{|partial, i|
          puts "  #{i+1}/#{partials.length}" if partials.length != 1
          f.write(partial.get.body.read)
        }
      }
    }
  end
}
