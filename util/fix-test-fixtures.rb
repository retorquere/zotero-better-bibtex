#!/usr/bin/env ruby

require 'json'

root = File.join(File.dirname(__FILE__), '..')
$supported = JSON.parse(File.read(File.join(root, 'gen/preferences.json'))).keys

def fixBBTJSON(lib, data)
  return unless data.is_a?(Hash)

  resave = false

  if data['config'] && data['config']['preferences']
    data['config']['preferences'].keys.each{|key|
      next if $supported.include?(key)
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

      if lib =~ /juris-m/
        duplicates = {
          'institution' => %w{publisher},
          'publicationTitle' => %w{websiteTitle bookTitle encyclopediaTitle proceedingsTitle},
          'type' => %w{reportType thesisType},
          'number' => %w{reportNumber},
        }
      else
        duplicates = {
          'publisher' => %w{university institution},
          'publicationTitle' => %w{websiteTitle bookTitle encyclopediaTitle proceedingsTitle},
          'type' => %w{reportType thesisType},
          'number' => %w{reportNumber},
        }
      end
      duplicates.each_pair{|generic, specifics|
        specifics.each{|specific|
          if item[specific] && (item[generic] == item[specific] || !item[generic])
            item[generic] = item[specific]
            item.delete(specific)
            resave = true
          end
        }
      }

      if lib =~ /juris-m/ && %w{conferencePaper book bookSection thesis}.include?(item['itemType']) && item['institution']
        item['publisher'] = item['institution']
        item.delete('institution')
      end
    }
  end

  if data['items']
    data['items'].each{|item|
      (item['creators'] || []).each{|creator|
        if creator['fieldMode'] == 1
          creator['name'] = creator['lastName']
          creator.delete('fieldMode')
          creator.delete('firstName')
          creator.delete('lastName')
          resave = true
        end
      }

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

  return unless resave

  puts lib

  File.open(lib, 'w'){|f| f.puts(JSON.pretty_generate(data)) }
end

def fixCSL(lib, data)
  return unless data.is_a?(Array)

  resave = false

  data.each{|item|

    %w{director editor author}.each{|kind|
      next unless item[kind]

      item[kind].each{|creator|
        if creator['isInstitution'] == 1
          creator['literal'] ||= creator['family']
          creator.delete('isInstitution')
          creator.delete('family')
          creator.delete('given')
          resave = true
        end
      }
    }
  }

  return unless resave

  puts lib

  File.open(lib, 'w'){|f| f.puts(JSON.pretty_generate(data)) }
end

Dir[File.join(root, 'test/fixtures/*/*.json')].each{|lib|
  data = JSON.parse(File.read(lib))
  if lib =~ /\.csl.json$/
    fixCSL(lib, data)
  else
    fixBBTJSON(lib, data)
  end
}
