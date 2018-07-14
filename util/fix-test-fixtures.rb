#!/usr/bin/env ruby

require 'json'

root = File.join(File.dirname(__FILE__), '..')
supported = JSON.parse(File.read(File.join(root, 'gen/preferences.json'))).keys

Dir[File.join(root, 'test/fixtures/*/*.json')].each{|lib|
  next if lib =~ /\.csl.json$/

  data = JSON.parse(File.read(lib))
  next unless data.is_a?(Hash)

  resave = false

  if data['config'] && data['config']['preferences']
    data['config']['preferences'].keys.each{|key|
      next if supported.include?(key)
      data['config']['preferences'].delete(key) 
      resave = true
    }
  end

  if data['items'] && lib =~ /\/import\//
    data['items'].each{|item|
      if item['extra']
        extra = item['extra']
        item['extra'].sub!(/\nbibtex:/, "\nCitation Key:")
        item['extra'].sub!(/^bibtex:/, "Citation Key:")

        resave ||= (extra != item['extra'])
      end

      duplicates = {
        'publisher' => %w{institution},
        'publicationTitle' => %w{proceedingsTitle},
        'type' => %w{thesisType},
      }
      duplicates.each_pair{|generic, specifics|
        specifics.each{|specific|
          if item[specific] && item[generic] == item[specific]
            item.delete(generic)
            resave = true
          end
        }
      }

      (item['creators'] || []).each{|creator|
        if creator['fieldMode'] == 1
          creator['name'] = creator['lastName']
          creator.delete('lastName')
          creator.delete('fieldMode')
          resave = true
        end
      }
    }
  end

  if data['items']
    data['items'].each{|item|
      if item['relations'] || item['collections']
        resave = true
        item.delete('relations')
        item.delete('collections')
      end

      if item['itemType'] == 'note'
        %w{uri uniqueFields seeAlso attachments key libraryID}.each{|key|
          resave ||= item.key?(key)
          item.delete(key)
        }
      end
    }
  end

  puts lib if resave

  File.open(lib, 'w'){|f| f.puts(JSON.pretty_generate(data)) } if resave
}
