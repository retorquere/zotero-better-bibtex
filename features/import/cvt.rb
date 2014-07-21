#!/usr/bin/env ruby
require 'json'
require 'bibtex'
require 'ostruct'
require 'fileutils'

Dir['*.json'].sort.each{|old|
  items = JSON.parse(open(old).read)
  next if items.is_a?(Hash)

  config = {'id' => '82512813-9edb-471c-aebc-eeaaf40c6cf9'}
  config = items[0].delete('__config__') if items[0]['__config__']

  items.each{|item|
    item.each_pair{|k, v|
      item.delete(k) if v == [] || v == {} || v == '' || k == 'itemID'
    }
    item['tags'].sort! if item['tags']
  }

  items = {'items' => items, 'config' => config}

  File.open(old, 'w'){|f| f.write(JSON.pretty_generate(items)) }
}

Dir['*.bib'].sort.each{|old|
  puts old
  bib = BibTeX.open(old)
  bib.each{|entry|
    next unless entry.respond_to?('file')
    files = entry.file.to_s.gsub(/\\;/, "\t").split(';').collect{|f| f.gsub(/\t/, ';')}.collect{|f|
      f = f.gsub(/\\:/, "\t").split(':').collect{|v| v.gsub("\t", ':')}
      if f.size == 1
        f[0].strip == '' ? nil : OpenStruct.new(path: f[0])
      elsif f.size == 3
        f[1].strip == '' ? nil : OpenStruct.new(title: f[0], path: f[1], mimetype: f[2])
      elsif f.size == 0
        nil
      else
        throw f.size
      end
    }.compact

    files.each{|f|
      f.path = f.path.sub(/.*?storage/, '') if f.path =~ /zotero.*storage/
      f.path.gsub!(/\\\\/, '/')
      f.path.sub!(/^[a-z]:/i, '')
      f.path.sub!(/^\//, '')
      prefix = File.basename(old, File.extname(old))
      while f.path[0, prefix.length] == prefix
        f.path = f.path[prefix.length, f.path.length]
        f.path.sub!(/^\//, '')
      end
      f.path = File.join(File.basename(old, File.extname(old)), f.path)
      next if File.file?(f.path)
      FileUtils.mkdir_p(File.dirname(f.path))
      File.open(f.path, 'w'){|o| o.write(f.path) }
    }

    entry.file = files.collect{|f|
      if f.mimetype
        f = [f.title, f.path, f.mimetype]
      else
        f = [f.path]
      end

      f = f.collect{|v| v.gsub(/([:;])/){ "\\#{$1}"}}.join(':')
    }.join(';')
    puts entry.file
  }
  bib.save_to(old)
}
